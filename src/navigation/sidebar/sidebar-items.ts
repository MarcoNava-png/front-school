import {
  ShoppingBag,
  Forklift,
  Mail,
  MessageSquare,
  Calendar,
  Kanban,
  ReceiptText,
  Users,
  Lock,
  Fingerprint,
  SquareArrowUpRight,
  LayoutDashboard,
  ChartBar,
  Banknote,
  Gauge,
  GraduationCap,
  BriefcaseBusiness,
  type LucideIcon,
} from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Acceso",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard/default",
        icon: LayoutDashboard,
      },
      /* {
        title: "CRM",
        url: "/dashboard/crm",
        icon: ChartBar,
      },
      {
        title: "Finance",
        url: "/dashboard/finance",
        icon: Banknote,
      },*/
      /* {
        title: "Analytics",
        url: "/dashboard/coming-soon",
        icon: Gauge,
        comingSoon: true,
      },
      {
        title: "E-commerce",
        url: "/dashboard/coming-soon",
        icon: ShoppingBag,
        comingSoon: true,
      },
      {
        title: "Academy",
        url: "/dashboard/coming-soon",
        icon: GraduationCap,
        comingSoon: true,
      },
      {
        title: "Logistics",
        url: "/dashboard/coming-soon",
        icon: Forklift,
        comingSoon: true,
      },*/
    ],
  },
  {
    id: 2,
    label: "Admisiones",
    items: [
      {
        title: "Listado de Aspirantes",
        url: "/applicants",
        icon: BriefcaseBusiness,
        subItems: [
          { title: "Aspirantes", url: "/dashboard/applicants", newTab: false },
        ],
      },
    ],
  },
  {
    id: 3,
    label: "Pages",
    items: [
      {
        title: "Catálogos",
        url: "/auth",
        icon: BriefcaseBusiness,
        subItems: [
          { title: "Campus", url: "/dashboard/campus", newTab: false },
          { title: "Materias", url: "/dashboard/subjects", newTab: false },
          { title: "Planes Estudio", url: "/dashboard/study-plans", newTab: false },
          { title: "Periodos Academicos", url: "/dashboard/academic-periods", newTab: false },
        ],
      },
    ],
  },
  {
    id: 4,
    label: "Estudiantes",
    items: [
      {
        title: "Gestión Estudiantil",
        url: "/students",
        icon: Users,
        subItems: [
          { title: "Estudiantes", url: "/dashboard/students", newTab: false },
          { title: "Inscripciones", url: "/dashboard/enrollments", newTab: false },
          { title: "Calificaciones", url: "/dashboard/grades", newTab: false },
          { title: "Asistencias", url: "/dashboard/attendances", newTab: false },
        ],
      }
    ]
  },
  {
    id: 5,
    label: "Academico",
    items: [
      {
        title: "Gestión Académica",
        url: "/academic",
        icon: Calendar,
        subItems: [
          { title: "Horarios", url: "/dashboard/schedules", newTab: false },
          { title: "Aulas", url: "/dashboard/classrooms", newTab: false },
          { title: "Profesores", url: "/dashboard/teachers", newTab: false },
        ],
      }
    ]
  },
  {
    id: 6,
    label: "Finanzas",
    items: [
      {
        title: "Gestión Financiera",
        url: "/financial",
        icon: Banknote,
        subItems: [
          { title: "Recibos", url: "/dashboard/invoices", newTab: false },
          { title: "Pagos", url: "/dashboard/payments", newTab: false },
          { title: "Reportes", url: "/dashboard/reports", newTab: false },
        ],
      }
    ]
  }
  /* }}{
    id: 3,
    label: "Misc",
    items: [
      {
        title: "Others",
        url: "/dashboard/coming-soon",
        icon: SquareArrowUpRight,
        comingSoon: true,
      },
    ],
  },*/
];
