"""
core/permissions.py — Role-Based Access Control
DRF permission classes enforcing the RBAC matrix (SAD Section 3.3).

The VIEWER role is a read-only "guest": it may perform safe (read) requests on
the role-gated endpoints below, but never write. Other roles are unchanged.
"""
from rest_framework.permissions import BasePermission, SAFE_METHODS
from .models import Role


class IsRoleAllowed(BasePermission):
    allowed_roles = []

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        view_roles = getattr(view, 'allowed_roles', self.allowed_roles)
        return request.user.role in view_roles


class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return (request.user and request.user.is_authenticated
                and request.user.role == Role.SUPER_ADMIN)


class IsFarmManagerOrAbove(BasePermission):
    ALLOWED = [Role.SUPER_ADMIN, Role.FARM_MANAGER]

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.role == Role.VIEWER:
            return request.method in SAFE_METHODS
        return request.user.role in self.ALLOWED


class IsAccountantOrAbove(BasePermission):
    ALLOWED = [Role.SUPER_ADMIN, Role.FARM_MANAGER, Role.ACCOUNTANT]

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.role == Role.VIEWER:
            return request.method in SAFE_METHODS
        return request.user.role in self.ALLOWED


class IsVetOrFarmManager(BasePermission):
    ALLOWED = [Role.SUPER_ADMIN, Role.FARM_MANAGER, Role.VET]

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.role == Role.VIEWER:
            return request.method in SAFE_METHODS
        return request.user.role in self.ALLOWED


class ReadOnlyForViewer(BasePermission):
    """Viewer = read-only (safe methods only); every other authenticated user is
    unaffected. Use on endpoints otherwise open to all authenticated users
    (e.g. milk) so the guest can read but not write."""
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.role == Role.VIEWER:
            return request.method in SAFE_METHODS
        return True


class IsAnyAuthenticated(BasePermission):
    """Any authenticated user — used for dashboard (Viewer+)."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
