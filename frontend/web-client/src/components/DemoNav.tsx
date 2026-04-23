import { DemoNavBar } from '@libi/shared-ui/components/DemoNavBar';

export function DemoNav({ current }: { current: "client" | "manager" | "vendor" }) {
  return <DemoNavBar current={current} />;
}
