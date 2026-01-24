import {
  Award,
  Banknote,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  Calendar,
  DollarSign,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  HandCoins,
  LayoutDashboard,
  Receipt,
  Shield,
  UserCircle,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
  requiredModule?: string;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
  requiredModule?: string;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
  requiredModule?: string;
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    requiredModule: "Dashboard",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard/default",
        icon: LayoutDashboard,
        requiredModule: "Dashboard",
      },
    ],
  },
  {
    id: 2,
    label: "ADMISIONES",
    requiredModule: "Admisiones",
    items: [
      {
        title: "Aspirantes",
        url: "/dashboard/applicants",
        icon: BriefcaseBusiness,
        requiredModule: "Admisiones",
      },
      {
        title: "Convenios",
        url: "/dashboard/convenios",
        icon: HandCoins,
        requiredModule: "Admisiones",
        isNew: true,
      },
    ],
  },
  {
    id: 3,
    label: "CATÁLOGOS",
    requiredModule: "Catalogos",
    items: [
      {
        title: "Campus",
        url: "/dashboard/campus",
        icon: Building2,
        requiredModule: "Catalogos",
      },
      {
        title: "Materias",
        url: "/dashboard/subjects",
        icon: BookOpen,
        requiredModule: "Catalogos",
      },
      {
        title: "Planes de Estudio",
        url: "/dashboard/study-plans",
        icon: FileText,
        requiredModule: "Catalogos",
      },
      {
        title: "Periodos Académicos",
        url: "/dashboard/academic-periods",
        icon: Calendar,
        requiredModule: "Catalogos",
      },
    ],
  },
  {
    id: 4,
    label: "ESTUDIANTES",
    requiredModule: "Estudiantes",
    items: [
      {
        title: "Gestión Estudiantil",
        url: "/students",
        icon: Users,
        requiredModule: "Estudiantes",
        subItems: [
          { title: "Estudiantes por Grupo", url: "/dashboard/students", newTab: false, requiredModule: "Estudiantes" },
          { title: "Inscripción a Grupos", url: "/dashboard/group-enrollment", newTab: false, requiredModule: "Estudiantes" },
          { title: "Calificaciones", url: "/dashboard/grades", newTab: false, requiredModule: "Academico" },
          { title: "Asistencias", url: "/dashboard/attendances", newTab: false, requiredModule: "Academico" },
        ],
      },
      {
        title: "Documentos",
        url: "/dashboard/documentos-estudiante",
        icon: Award,
        requiredModule: "Estudiantes",
        isNew: true,
      },
      {
        title: "Importar Estudiantes",
        url: "/dashboard/importar-estudiantes",
        icon: FileSpreadsheet,
        requiredModule: "Estudiantes",
        isNew: true,
      },
      {
        title: "Inscribir a Grupos",
        url: "/dashboard/inscribir-estudiantes-grupo",
        icon: UserPlus,
        requiredModule: "Estudiantes",
        isNew: true,
      },
    ],
  },
  {
    id: 5,
    label: "ACADÉMICO",
    requiredModule: "Academico",
    items: [
      {
        title: "Gestión Académica",
        url: "/academic",
        icon: GraduationCap,
        requiredModule: "Academico",
        subItems: [
          { title: "Grupos", url: "/dashboard/academic-management", newTab: false, requiredModule: "Academico" },
          { title: "Promoción", url: "/dashboard/promotions", newTab: false, requiredModule: "Academico", isNew: true },
          { title: "Horarios", url: "/dashboard/schedules", newTab: false, requiredModule: "Academico" },
          // { title: "Aulas", url: "/dashboard/classrooms", newTab: false, requiredModule: "Academico" },
          { title: "Profesores", url: "/dashboard/teachers", newTab: false, requiredModule: "Academico" },
        ],
      },
    ],
  },
  {
    id: 6,
    label: "FINANZAS",
    requiredModule: "Finanzas",
    items: [
      {
        title: "Caja",
        url: "/dashboard/cashier",
        icon: DollarSign,
        isNew: true,
        requiredModule: "Finanzas",
      },
      {
        title: "Recibos",
        url: "/receipts",
        icon: Receipt,
        requiredModule: "Finanzas",
        subItems: [
          { title: "Administración", url: "/dashboard/receipts", newTab: false, requiredModule: "Finanzas" },
          { title: "Mis Recibos", url: "/dashboard/receipts/my-receipts", newTab: false, isNew: true },
        ],
      },
      {
        title: "Gestión Financiera",
        url: "/financial",
        icon: Banknote,
        requiredModule: "Finanzas",
        subItems: [
          { title: "Corte de Caja", url: "/dashboard/cashier/corte", newTab: false, isNew: true, requiredModule: "Finanzas" },
          { title: "Plantillas de Cobro", url: "/dashboard/payment-templates", newTab: false, isNew: true, requiredModule: "Finanzas" },
          { title: "Conceptos de Pago", url: "/dashboard/payment-concepts", newTab: false, isNew: true, requiredModule: "Finanzas" },
          { title: "Becas", url: "/dashboard/scholarships", newTab: false, isNew: true, requiredModule: "Finanzas" },
          { title: "Pagos", url: "/dashboard/payments", newTab: false, requiredModule: "Finanzas" },
          { title: "Reportes", url: "/dashboard/reports", newTab: false, requiredModule: "Finanzas" },
        ],
      },
    ],
  },
  {
    id: 7,
    label: "CONFIGURACIÓN",
    requiredModule: "Configuracion",
    items: [
      {
        title: "Usuarios",
        url: "/dashboard/users",
        icon: UserCircle,
        requiredModule: "Configuracion",
      },
      {
        title: "Roles y Permisos",
        url: "/dashboard/roles",
        icon: Shield,
        requiredModule: "Configuracion",
        isNew: true,
      },
    ],
  },
];

// Funcion para filtrar items del sidebar segun modulos accesibles
export function filterSidebarByModules(accessibleModules: string[]): NavGroup[] {
  return sidebarItems
    .filter((group) => {
      // Si no tiene modulo requerido, mostrar siempre
      if (!group.requiredModule) return true;
      return accessibleModules.includes(group.requiredModule);
    })
    .map((group) => ({
      ...group,
      items: group.items
        .filter((item) => {
          if (!item.requiredModule) return true;
          return accessibleModules.includes(item.requiredModule);
        })
        .map((item) => ({
          ...item,
          subItems: item.subItems?.filter((subItem) => {
            if (!subItem.requiredModule) return true;
            return accessibleModules.includes(subItem.requiredModule);
          }),
        })),
    }))
    .filter((group) => group.items.length > 0);
}
