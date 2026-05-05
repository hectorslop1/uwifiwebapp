export type SupportTicketCategory = {
  id: number;
  issueName: string;
  category: string;
  createdAt: string | null;
};

export type SupportTicket = {
  id: number;
  customerName: string;
  category: string;
  type: string;
  description: string;
  customerId: number;
  files: string[];
  createdAt: string | null;
  status: string | null;
  title: string | null;
  assignedTo: string | null;
};

export type CreateSupportTicketInput = {
  customerName: string;
  customerId: number;
  category: string;
  title: string;
  description: string;
  files?: File[];
};
