export type AffiliateInviteActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialAffiliateInviteActionState: AffiliateInviteActionState = {
  status: "idle",
  message: "",
};
