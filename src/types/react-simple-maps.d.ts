declare module "react-simple-maps" {
  import { ComponentType, ReactNode, SVGProps } from "react";

  export interface GeographyStyle extends SVGProps<SVGPathElement> {
    outline?: string;
    cursor?: string;
  }

  export interface GeographyProps extends SVGProps<SVGPathElement> {
    geography: Geography;
    style?: {
      default?: GeographyStyle;
      hover?: GeographyStyle;
      pressed?: GeographyStyle;
    };
    onMouseEnter?: (evt: React.MouseEvent<SVGPathElement>, geo: Geography) => void;
    onMouseLeave?: (evt: React.MouseEvent<SVGPathElement>, geo: Geography) => void;
    onClick?: (evt: React.MouseEvent<SVGPathElement>, geo: Geography) => void;
  }

  export interface Geography {
    rsmKey: string;
    properties: Record<string, unknown>;
    geometry: unknown;
  }

  export interface GeographiesProps {
    geography: string | object;
    children: (props: { geographies: Geography[] }) => ReactNode;
    parseGeographies?: (geos: Geography[]) => Geography[];
  }

  export interface MarkerProps extends SVGProps<SVGGElement> {
    coordinates: [number, number];
    children?: ReactNode;
  }

  export interface ZoomableGroupProps {
    zoom?: number;
    center?: [number, number];
    minZoom?: number;
    maxZoom?: number;
    children?: ReactNode;
    onMoveStart?: (position: { coordinates: [number, number]; zoom: number }, evt: unknown) => void;
    onMove?: (position: { x: number; y: number; zoom: number; dragging: boolean }, evt: unknown) => void;
    onMoveEnd?: (position: { coordinates: [number, number]; zoom: number }, evt: unknown) => void;
  }

  export interface ComposableMapProps extends SVGProps<SVGSVGElement> {
    projection?: string;
    projectionConfig?: Record<string, unknown>;
    children?: ReactNode;
  }

  export const ComposableMap: ComponentType<ComposableMapProps>;
  export const Geographies: ComponentType<GeographiesProps>;
  export const Geography: ComponentType<GeographyProps>;
  export const Marker: ComponentType<MarkerProps>;
  export const ZoomableGroup: ComponentType<ZoomableGroupProps>;
}
