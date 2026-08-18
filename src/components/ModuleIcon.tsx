import {
    BriefcaseBusiness,
    CarFront,
    Home,
    Utensils
} from "lucide-react";

type ModuleIconName =
    | "home"
    | "utensils"
    | "car"
    | "business";

type ModuleIconProps = {
    name: string;
    size?: number;
};

const moduleIcons = {
    home: Home,
    utensils: Utensils,
    car: CarFront,
    business: BriefcaseBusiness
} as const;

const ModuleIcon = ({
    name,
    size = 18
}: ModuleIconProps) => {
    const Icon =
        moduleIcons[
        name as ModuleIconName
        ] ?? BriefcaseBusiness;

    return <Icon size={size} />;
};

export default ModuleIcon;