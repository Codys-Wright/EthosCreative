import { Card, CardContent } from "@/components/ui/card";
import { useWidgetStore } from "../widget-context";

export interface WidgetProps {
  size?: {
    width: number;
    height: number;
  };
  id?: string;
}

export interface BaseWidgetProps extends WidgetProps {
  children?: React.ReactNode;
}

const NotImplemented = ({ size }: { size: string }) => (
  <div className="flex items-center justify-center h-full text-muted-foreground">
    Size {size} not implemented
  </div>
);

export function BaseWidget({ size, id, children }: BaseWidgetProps) {
  const widgetSize = useWidgetStore((state) => state.getWidgetSize(id ?? ""));
  const actualSize = id ? widgetSize : size;

  // Ensure we have valid numbers for width and height
  const width = actualSize?.width || 1;
  const height = actualSize?.height || 1;

  return (
    <Card className="h-full">
      <CardContent className="p-4">
        {children || <NotImplemented size={`${width}x${height}`} />}
      </CardContent>
    </Card>
  );
}

export function createSizeComponent<T extends WidgetProps>(
  Component: React.ComponentType<T>,
  supportedSizes: { width: number; height: number }[],
) {
  return function WidgetWithSize(props: T) {
    const widgetSize = useWidgetStore((state) =>
      state.getWidgetSize(props.id ?? ""),
    );
    const actualSize = props.id ? widgetSize : props.size;
    const width = actualSize?.width || 1;
    const height = actualSize?.height || 1;

    const isSupported = supportedSizes.some(
      (size) => size.width === width && size.height === height,
    );

    return (
      <BaseWidget {...props}>
        {isSupported ? (
          <Component {...props} />
        ) : (
          <NotImplemented size={`${width}x${height}`} />
        )}
      </BaseWidget>
    );
  };
}
