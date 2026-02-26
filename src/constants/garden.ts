export const SELECTED_PLANT_STORAGE_KEY = 'garden_selected_plant_id';
export const GARDEN_PENDING_ACTION_STORAGE_KEY = 'garden_pending_action';

export const GARDEN_PENDING_ACTIONS = {
  UPDATE_PHOTO: 'update_photo',
} as const;

export type GardenPendingActionKey =
  (typeof GARDEN_PENDING_ACTIONS)[keyof typeof GARDEN_PENDING_ACTIONS];
