export type CreateSupportTicketActionState = {
  status: "idle" | "error";
  message: string;
};

export const initialCreateSupportTicketActionState: CreateSupportTicketActionState =
  {
    status: "idle",
    message: "",
  };
