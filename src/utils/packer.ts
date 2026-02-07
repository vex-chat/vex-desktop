import { Packr } from "msgpackr";

// Configuration must match the backend (moreTypes: true)
export const packer = new Packr({ useRecords: false, moreTypes: true });
