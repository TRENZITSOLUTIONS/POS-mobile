// Business setup types
export interface BusinessInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  gstNumber?: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  joinDate: string;
}

// Billing types
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  gstRate?: number;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface BillData {
  cart: CartItem[];
  subtotal: number;
  discount: number;
  gst: number;
  total: number;
  paymentMethod: 'Cash' | 'UPI';
  billNumber: string;
  timestamp: string;
}

// Navigation types
export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  BusinessSetup1: undefined;
  BusinessSetupStep2: { businessData: any };
  BusinessSetupStep3: { businessData: any };
  CreatingBusiness: { businessData: any };
  SetupSuccess: { businessName?: string };
  SetupFailure: { error: string };
  ModeSelection: undefined;
  JoinBusiness: undefined;
  
  // Billing flow
  Billing: undefined;
  Checkout: { cart: CartItem[] };
  BillSuccess: BillData;

  // Dashboard flow
  Dashboard: undefined;
  SelectSummaryDate: undefined;
  DownloadingSummary: {
    dateRange: 'today' | 'yesterday' | 'last7days' | 'custom';
    customDays?: string;
  };
  BillSummary: {
    dateRange: 'today' | 'yesterday' | 'last7days' | 'custom';
    customDays?: string;
  };
  SaveSuccess: undefined;
  
  // Admin flow
  AdminPin: undefined;
  AdminDashboard: undefined;
  ItemManagement: undefined;
  AddItem: undefined;
  EditItem: { item: MenuItem };
  
  // Bill Format Options
  BillFormat: undefined;
  BusinessDetails: undefined;
  InvoiceFormat: undefined;
  InvoiceStructure: undefined;
  LogoUpload: undefined;
  FooterNote: undefined;
  BillNumbering: undefined;
  
  // Other Admin Options
  GSTSettings: undefined;
  PrinterSetup: undefined;
  AddPeople: undefined;
  BackupData: undefined;
  TestPrintPreview: undefined;
  BackupDetails: undefined;
  BackingUp: undefined;
  BackupComplete: undefined;
  ExportBills: undefined;
  BillScanner: undefined;
  BillPreview: {
    photoPath: string;
  };
  ExportingBills: {
    exportType: 'all' | 'dateRange' | 'today';
    customDays?: string;
    billData?: any;
  };
  ExportSuccess: {
    exportType: string;
    billData?: any;
  };
  RestoreData: undefined;
  RestoringData: {
    fileName: string;
  };
  RestoreSuccess: {
    fileName: string;
  };
};