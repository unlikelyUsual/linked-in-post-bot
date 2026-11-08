export interface SystemDesignComponent {
  id: string;
  name: string;
  type: "client" | "service" | "data" | "queue" | "external";
}

export interface SystemDesignConnection {
  from: string;
  to: string;
  label: string;
}

export interface SystemDesignDiagram {
  title: string;
  components: SystemDesignComponent[];
  connections: SystemDesignConnection[];
}

export interface SystemDesignPost {
  content: string;
  diagram: SystemDesignDiagram;
}
