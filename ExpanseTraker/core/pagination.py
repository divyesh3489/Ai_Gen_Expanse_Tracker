"""
Central cursor pagination for DRF list endpoints.

**Frontend breaking change:** Paginated list GET responses use::
    { "next", "previous", "page_size", "results": [...] }
  instead of a bare JSON array. Endpoints that intentionally skip pagination
  (categories, merged preference catalog, budget summary) still return arrays.

See ``apply_cursor_pagination`` for usage from plain ``APIView`` handlers (global
``DEFAULT_PAGINATION_CLASS`` does not apply to ``APIView``).

**Frontend (update clients; not changed in this repo):** list consumers that expect
a raw array should read ``response.data.results`` and follow ``next`` cursors:
``frontend/src/features/expanses/api.ts`` (listExpanses),
``frontend/src/features/incomes/api.ts`` (listIncomes),
``frontend/src/features/recurring/api.ts`` (listRecurring),
``frontend/src/features/budgets/api.ts`` (listBudgets),
and ``frontend/src/pages/DashboardPage.tsx`` (queries those lists).
Categories / user-category-preferences responses are unchanged (arrays).
"""
from __future__ import annotations

from typing import Any

from rest_framework.pagination import CursorPagination
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView


class StandardCursorPagination(CursorPagination):
    """
    Default cursor pagination for transactional lists (expenses, incomes, etc.).
    Ordering on the class is a fallback; prefer overriding ordering on resource-specific subclasses.

    Note: DRF cursor tokens assume a stable ordering; multi-field ``ordering`` tuples tie-break
    with ``-id`` where possible. Querysets must use the same ``order_by()`` as ``ordering``.
    """

    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100
    ordering = "-created_at"

    def get_paginated_response(self, data: Any) -> Response:
        return Response(
            {
                "next": self.get_next_link(),
                "previous": self.get_previous_link(),
                "page_size": self.page_size,
                "results": data,
            }
        )


class SmallCursorPagination(StandardCursorPagination):
    """Smaller pages when tighter batches are desired (optional use)."""

    page_size = 10
    max_page_size = 50


class LargeCursorPagination(StandardCursorPagination):
    """Larger pages for heavier reads (optional use)."""

    page_size = 50
    max_page_size = 200


class ExpanseCursorPagination(StandardCursorPagination):
    """Expenses: newest transaction date first, then creation time, then id."""

    ordering = ("-date", "-created_at", "-id")


class IncomeCursorPagination(StandardCursorPagination):
    """Incomes: same ordering strategy as expenses."""

    ordering = ("-date", "-created_at", "-id")


class RecurringCursorPagination(StandardCursorPagination):
    """Recurring: by start date (most recent first), then created_at, id."""

    ordering = ("-start_date", "-created_at", "-id")


class BudgetCursorPagination(StandardCursorPagination):
    """Budgets: most recently created first."""

    ordering = ("-created_at", "-id")


def apply_cursor_pagination(
    request: Request,
    view: APIView,
    queryset,
    serializer_class: type,
    pagination_class: type[CursorPagination],
    *,
    extra_serializer_context: dict[str, Any] | None = None,
) -> Response:
    """
    Run cursor pagination for a plain APIView list handler (DRF does not inject
    pagination into APIView automatically).
    """
    paginator = pagination_class()
    page = paginator.paginate_queryset(queryset, request, view=view)
    ctx: dict[str, Any] = {"request": request}
    if extra_serializer_context:
        ctx.update(extra_serializer_context)
    serializer = serializer_class(page, many=True, context=ctx)
    return paginator.get_paginated_response(serializer.data)
