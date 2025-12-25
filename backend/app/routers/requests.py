from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models import ServiceRequest, User, MechanicProfile, RequestStatus, UserRole
from app.schemas import ServiceRequestCreate, ServiceRequestResponse
from app.auth import get_current_user

router = APIRouter()


# ==================== USER ENDPOINTS ====================

# Create new service request
@router.post("/requests", response_model=ServiceRequestResponse, status_code=status.HTTP_201_CREATED)
def create_request(
    request_data: ServiceRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new service request.
    Only users can create requests.
    Users can only have one active request at a time.
    """
    
    # Verify user role
    if current_user.role != UserRole.USER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only users can create service requests"
        )
    
    # Check if user already has an active request
    active_request = db.query(ServiceRequest).filter(
        ServiceRequest.user_id == current_user.id,
        ServiceRequest.status.in_([
            RequestStatus.PENDING, 
            RequestStatus.ACCEPTED, 
            RequestStatus.IN_PROGRESS
        ])
    ).first()
    
    if active_request:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have an active request. Please wait for it to complete or cancel it."
        )
    
    # Create new request
    new_request = ServiceRequest(
        user_id=current_user.id,
        vehicle_type=request_data.vehicle_type,
        problem_description=request_data.problem_description,
        latitude=request_data.latitude,
        longitude=request_data.longitude,
        address=request_data.address,
        status=RequestStatus.PENDING
    )
    
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    
    return new_request


# Get current user's requests (history)
@router.get("/requests/my-requests", response_model=List[ServiceRequestResponse])
def get_my_requests(
    status_filter: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all requests for the current user.
    Optional: filter by status (pending, accepted, in_progress, completed, cancelled)
    """
    
    query = db.query(ServiceRequest).filter(
        ServiceRequest.user_id == current_user.id
    )
    
    # Apply status filter if provided
    if status_filter:
        try:
            status_enum = RequestStatus(status_filter.lower())
            query = query.filter(ServiceRequest.status == status_enum)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status: {status_filter}"
            )
    
    # Order by newest first and apply pagination
    requests = query.order_by(desc(ServiceRequest.created_at)).offset(offset).limit(limit).all()
    
    return requests


# Get user's active request (if any)
@router.get("/requests/active", response_model=Optional[ServiceRequestResponse])
def get_active_request(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get the current active request for the user.
    Returns null if no active request.
    """
    
    active_request = db.query(ServiceRequest).filter(
        ServiceRequest.user_id == current_user.id,
        ServiceRequest.status.in_([
            RequestStatus.PENDING, 
            RequestStatus.ACCEPTED, 
            RequestStatus.IN_PROGRESS
        ])
    ).first()
    
    return active_request


# Get request statistics for user
@router.get("/requests/stats")
def get_request_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get request statistics for the current user.
    """
    
    # Base query for user's requests
    base_query = db.query(ServiceRequest).filter(
        ServiceRequest.user_id == current_user.id
    )
    
    total = base_query.count()
    
    pending = base_query.filter(
        ServiceRequest.status == RequestStatus.PENDING
    ).count()
    
    in_progress = base_query.filter(
        ServiceRequest.status.in_([RequestStatus.ACCEPTED, RequestStatus.IN_PROGRESS])
    ).count()
    
    completed = base_query.filter(
        ServiceRequest.status == RequestStatus.COMPLETED
    ).count()
    
    cancelled = base_query.filter(
        ServiceRequest.status == RequestStatus.CANCELLED
    ).count()
    
    return {
        "total": total,
        "pending": pending,
        "in_progress": in_progress,
        "completed": completed,
        "cancelled": cancelled
    }


# Get single request by ID
@router.get("/requests/{request_id}", response_model=ServiceRequestResponse)
def get_request_by_id(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific request by ID.
    Users can only view their own requests.
    Mechanics can view requests assigned to them.
    """
    
    request = db.query(ServiceRequest).filter(
        ServiceRequest.id == request_id
    ).first()
    
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found"
        )
    
    # Check authorization
    if current_user.role == UserRole.USER:
        if request.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this request"
            )
    elif current_user.role == UserRole.MECHANIC:
        # Get mechanic profile
        mechanic_profile = db.query(MechanicProfile).filter(
            MechanicProfile.user_id == current_user.id
        ).first()
        
        if not mechanic_profile or request.mechanic_id != mechanic_profile.id:
            # Mechanic can view pending requests (for accepting) or their assigned requests
            if request.status != RequestStatus.PENDING and request.mechanic_id != mechanic_profile.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized to view this request"
                )
    
    return request


# Cancel a request
@router.patch("/requests/{request_id}/cancel", response_model=ServiceRequestResponse)
def cancel_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Cancel a pending or accepted request.
    Only the request owner can cancel.
    """
    
    request = db.query(ServiceRequest).filter(
        ServiceRequest.id == request_id,
        ServiceRequest.user_id == current_user.id
    ).first()
    
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found"
        )
    
    # Can only cancel pending or accepted requests
    if request.status not in [RequestStatus.PENDING, RequestStatus.ACCEPTED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel request with status: {request.status.value}"
        )
    
    request.status = RequestStatus.CANCELLED
    db.commit()
    db.refresh(request)
    
    return request


# ==================== MECHANIC ENDPOINTS (For Phase 3) ====================

# Get nearby pending requests (for mechanics)
@router.get("/requests/nearby/pending", response_model=List[ServiceRequestResponse])
def get_nearby_pending_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get pending requests near the mechanic's location.
    Only available for mechanics with completed profiles.
    """
    
    if current_user.role != UserRole.MECHANIC:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only mechanics can access this endpoint"
        )
    
    # Get mechanic profile
    mechanic_profile = db.query(MechanicProfile).filter(
        MechanicProfile.user_id == current_user.id
    ).first()
    
    if not mechanic_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please complete your mechanic profile first"
        )
    
    # For now, return all pending requests
    # In Phase 3, we'll add distance filtering based on mechanic's location
    pending_requests = db.query(ServiceRequest).filter(
        ServiceRequest.status == RequestStatus.PENDING
    ).order_by(desc(ServiceRequest.created_at)).all()
    
    return pending_requests


# Accept a request (for mechanics)
@router.patch("/requests/{request_id}/accept", response_model=ServiceRequestResponse)
def accept_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Accept a pending request.
    Only mechanics can accept requests.
    """
    
    if current_user.role != UserRole.MECHANIC:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only mechanics can accept requests"
        )
    
    # Get mechanic profile
    mechanic_profile = db.query(MechanicProfile).filter(
        MechanicProfile.user_id == current_user.id
    ).first()
    
    if not mechanic_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please complete your mechanic profile first"
        )
    
    # Get the request
    request = db.query(ServiceRequest).filter(
        ServiceRequest.id == request_id
    ).first()
    
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found"
        )
    
    if request.status != RequestStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This request is no longer available"
        )
    
    # Accept the request
    request.mechanic_id = mechanic_profile.id
    request.status = RequestStatus.ACCEPTED
    request.accepted_at = datetime.utcnow()
    
    db.commit()
    db.refresh(request)
    
    return request


# Update request status (for mechanics)
@router.patch("/requests/{request_id}/status", response_model=ServiceRequestResponse)
def update_request_status(
    request_id: int,
    new_status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update request status.
    Mechanics can update: accepted -> in_progress -> completed
    """
    
    if current_user.role != UserRole.MECHANIC:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only mechanics can update request status"
        )
    
    # Get mechanic profile
    mechanic_profile = db.query(MechanicProfile).filter(
        MechanicProfile.user_id == current_user.id
    ).first()
    
    if not mechanic_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mechanic profile not found"
        )
    
    # Get the request
    request = db.query(ServiceRequest).filter(
        ServiceRequest.id == request_id,
        ServiceRequest.mechanic_id == mechanic_profile.id
    ).first()
    
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found or not assigned to you"
        )
    
    # Validate status transition
    try:
        new_status_enum = RequestStatus(new_status.lower())
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status: {new_status}"
        )
    
    valid_transitions = {
        RequestStatus.ACCEPTED: [RequestStatus.IN_PROGRESS, RequestStatus.CANCELLED],
        RequestStatus.IN_PROGRESS: [RequestStatus.COMPLETED],
    }
    
    if request.status not in valid_transitions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot update status from: {request.status.value}"
        )
    
    if new_status_enum not in valid_transitions[request.status]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid transition from {request.status.value} to {new_status}"
        )
    
    # Update status
    request.status = new_status_enum
    
    if new_status_enum == RequestStatus.COMPLETED:
        request.completed_at = datetime.utcnow()
        # Increment mechanic's job count
        mechanic_profile.total_jobs += 1
    
    db.commit()
    db.refresh(request)
    
    return request