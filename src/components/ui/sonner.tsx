import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      dir="rtl"
      position="top-center"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast glass-card cyan-glow-border !bg-[#0a0e1e]/95 !text-foreground !border-white/10 rounded-2xl",
          description: "!text-muted-foreground",
          actionButton: "!bg-primary !text-primary-foreground",
          cancelButton: "!bg-white/10 !text-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
