import { getRequest, postRequest } from '../api/http';
import type {
  ApiSuccessResponse,
  PlacePublicOrderPayload,
  PlacePublicOrderResponse,
  PublicMenuResponse,
  PublicOrderStatusResponse,
  PublicRestaurantInfo,
  PublicTableValidationResponse,
} from '../types/customer';

export async function getPublicRestaurantInfo(slug: string) {
  return getRequest<ApiSuccessResponse<PublicRestaurantInfo>>(
    `/public/${slug}/restaurant`
  );
}

export async function validatePublicTable(slug: string, tableId: string) {
  return getRequest<ApiSuccessResponse<PublicTableValidationResponse>>(
    `/public/${slug}/table/${tableId}`
  );
}

export async function getPublicMenu(slug: string) {
  return getRequest<ApiSuccessResponse<PublicMenuResponse>>(
    `/public/${slug}/menu`
  );
}

export async function placePublicOrder(
  slug: string,
  payload: PlacePublicOrderPayload
) {
  return postRequest<PlacePublicOrderResponse>(
    `/public/${slug}/orders`,
    payload
  );
}

export async function getPublicOrderStatus(orderToken: string) {
  return getRequest<PublicOrderStatusResponse>(
    `/public/orders/${orderToken}`
  );
}