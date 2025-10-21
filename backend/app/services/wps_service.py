"""
WPS (Welding Procedure Specification) service for the welding system backend.
"""
from typing import Any, Dict, List, Optional
from datetime import datetime

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.models.wps import WPS, WPSRevision
from app.schemas.wps import WPSCreate, WPSUpdate, WPSRevisionCreate


class WPSService:
    """WPS service class."""

    def get(self, db: Session, *, id: int) -> Optional[WPS]:
        """Get WPS by ID."""
        return db.query(WPS).filter(WPS.id == id).first()

    def get_by_number(self, db: Session, *, wps_number: str) -> Optional[WPS]:
        """Get WPS by WPS number."""
        return db.query(WPS).filter(WPS.wps_number == wps_number).first()

    def get_multi(
        self,
        db: Session,
        *,
        skip: int = 0,
        limit: int = 100,
        owner_id: Optional[int] = None,
        status: Optional[str] = None,
        search_term: Optional[str] = None
    ) -> List[WPS]:
        """Get multiple WPS with filtering options."""
        query = db.query(WPS).filter(WPS.is_active == True)

        if owner_id:
            query = query.filter(WPS.owner_id == owner_id)

        if status:
            query = query.filter(WPS.status == status)

        if search_term:
            search_filter = or_(
                WPS.title.ilike(f"%{search_term}%"),
                WPS.wps_number.ilike(f"%{search_term}%"),
                WPS.company.ilike(f"%{search_term}%"),
                WPS.project_name.ilike(f"%{search_term}%"),
                WPS.welding_process.ilike(f"%{search_term}%"),
                WPS.base_material_spec.ilike(f"%{search_term}%")
            )
            query = query.filter(search_filter)

        return query.offset(skip).limit(limit).all()

    def create(self, db: Session, *, obj_in: WPSCreate, owner_id: int) -> WPS:
        """Create new WPS."""
        # Check if WPS number already exists
        existing_wps = self.get_by_number(db, wps_number=obj_in.wps_number)
        if existing_wps:
            raise ValueError(f"WPS number {obj_in.wps_number} already exists")

        db_obj = WPS(
            **obj_in.model_dump(),
            owner_id=owner_id
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self,
        db: Session,
        *,
        db_obj: WPS,
        obj_in: WPSUpdate
    ) -> WPS:
        """Update WPS."""
        update_data = obj_in.model_dump(exclude_unset=True)

        # Check if WPS number is being changed and if it already exists
        if "wps_number" in update_data and update_data["wps_number"] != db_obj.wps_number:
            existing_wps = self.get_by_number(db, wps_number=update_data["wps_number"])
            if existing_wps and existing_wps.id != db_obj.id:
                raise ValueError(f"WPS number {update_data['wps_number']} already exists")

        for field, value in update_data.items():
            setattr(db_obj, field, value)

        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: int) -> WPS:
        """Soft delete WPS."""
        obj = db.query(WPS).get(id)
        if not obj:
            raise ValueError("WPS not found")

        obj.is_active = False
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    def get_revisions(self, db: Session, *, wps_id: int) -> List[WPSRevision]:
        """Get all revisions for a WPS."""
        return db.query(WPSRevision).filter(
            WPSRevision.wps_id == wps_id
        ).order_by(WPSRevision.change_date.desc()).all()

    def create_revision(
        self,
        db: Session,
        *,
        wps_id: int,
        obj_in: WPSRevisionCreate,
        changed_by: int
    ) -> WPSRevision:
        """Create new WPS revision."""
        db_obj = WPSRevision(
            **obj_in.model_dump(),
            wps_id=wps_id,
            changed_by=changed_by,
            change_date=datetime.utcnow()
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update_status(
        self,
        db: Session,
        *,
        wps_id: int,
        status: str,
        reviewed_by: Optional[int] = None,
        approved_by: Optional[int] = None
    ) -> WPS:
        """Update WPS status."""
        wps = self.get(db, id=wps_id)
        if not wps:
            raise ValueError("WPS not found")

        wps.status = status

        if reviewed_by:
            wps.reviewed_by = reviewed_by
            wps.reviewed_date = datetime.utcnow()

        if approved_by:
            wps.approved_by = approved_by
            wps.approved_date = datetime.utcnow()

        db.add(wps)
        db.commit()
        db.refresh(wps)
        return wps

    def search_wps(
        self,
        db: Session,
        *,
        search_params: dict
    ) -> List[WPS]:
        """Advanced WPS search."""
        query = db.query(WPS).filter(WPS.is_active == True)

        # Search term
        if search_params.get("search_term"):
            search_term = search_params["search_term"]
            search_filter = or_(
                WPS.title.ilike(f"%{search_term}%"),
                WPS.wps_number.ilike(f"%{search_term}%"),
                WPS.company.ilike(f"%{search_term}%"),
                WPS.project_name.ilike(f"%{search_term}%"),
                WPS.welding_process.ilike(f"%{search_term}%"),
                WPS.base_material_spec.ilike(f"%{search_term}%"),
                WPS.filler_material_classification.ilike(f"%{search_term}%")
            )
            query = query.filter(search_filter)

        # Status filter
        if search_params.get("status"):
            query = query.filter(WPS.status == search_params["status"])

        # Welding process filter
        if search_params.get("welding_process"):
            query = query.filter(WPS.welding_process == search_params["welding_process"])

        # Base material group filter
        if search_params.get("base_material_group"):
            query = query.filter(WPS.base_material_group == search_params["base_material_group"])

        # Company filter
        if search_params.get("company"):
            query = query.filter(WPS.company.ilike(f"%{search_params['company']}%"))

        # Date range filter
        if search_params.get("date_from"):
            query = query.filter(WPS.created_at >= search_params["date_from"])

        if search_params.get("date_to"):
            query = query.filter(WPS.created_at <= search_params["date_to"])

        # Owner filter
        if search_params.get("owner_id"):
            query = query.filter(WPS.owner_id == search_params["owner_id"])

        # Sorting
        sort_by = search_params.get("sort_by", "created_at")
        sort_order = search_params.get("sort_order", "desc")

        if hasattr(WPS, sort_by):
            if sort_order.lower() == "desc":
                query = query.order_by(getattr(WPS, sort_by).desc())
            else:
                query = query.order_by(getattr(WPS, sort_by).asc())

        # Pagination
        skip = search_params.get("skip", 0)
        limit = search_params.get("limit", 100)

        return query.offset(skip).limit(limit).all()

    def get_wps_by_status(
        self,
        db: Session,
        *,
        status: str,
        owner_id: Optional[int] = None
    ) -> List[WPS]:
        """Get WPS by status."""
        query = db.query(WPS).filter(
            and_(WPS.status == status, WPS.is_active == True)
        )

        if owner_id:
            query = query.filter(WPS.owner_id == owner_id)

        return query.order_by(WPS.updated_at.desc()).all()

    def get_wps_by_company(
        self,
        db: Session,
        *,
        company: str,
        owner_id: Optional[int] = None
    ) -> List[WPS]:
        """Get WPS by company."""
        query = db.query(WPS).filter(
            and_(WPS.company.ilike(f"%{company}%"), WPS.is_active == True)
        )

        if owner_id:
            query = query.filter(WPS.owner_id == owner_id)

        return query.order_by(WPS.updated_at.desc()).all()

    def get_wps_count(
        self,
        db: Session,
        *,
        owner_id: Optional[int] = None
    ) -> Dict[str, int]:
        """Get WPS count by status."""
        query = db.query(WPS).filter(WPS.is_active == True)

        if owner_id:
            query = query.filter(WPS.owner_id == owner_id)

        total = query.count()
        draft = query.filter(WPS.status == "draft").count()
        approved = query.filter(WPS.status == "approved").count()
        obsolete = query.filter(WPS.status == "obsolete").count()

        return {
            "total": total,
            "draft": draft,
            "approved": approved,
            "obsolete": obsolete
        }

    def get_wps_statistics(
        self,
        db: Session,
        *,
        owner_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """Get WPS statistics."""
        query = db.query(WPS).filter(WPS.is_active == True)

        if owner_id:
            query = query.filter(WPS.owner_id == owner_id)

        # Total count
        total_count = query.count()

        # Count by status
        status_counts = {}
        for status in ["draft", "approved", "obsolete"]:
            count = query.filter(WPS.status == status).count()
            status_counts[status] = count

        # Count by welding process
        process_counts = {}
        processes = db.query(WPS.welding_process).filter(
            and_(WPS.welding_process.isnot(None), WPS.is_active == True)
        ).distinct().all()

        for (process,) in processes:
            if process:
                count = query.filter(WPS.welding_process == process).count()
                process_counts[process] = count

        # Recently created
        recent_count = query.filter(
            WPS.created_at >= datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        ).count()

        return {
            "total_count": total_count,
            "status_counts": status_counts,
            "process_counts": process_counts,
            "recent_count": recent_count
        }


# Create global WPS service instance
wps_service = WPSService()