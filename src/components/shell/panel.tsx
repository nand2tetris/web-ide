import { CSSProperties, ReactNode } from "react";

export const Panel = (props: {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) => {
  return (
    <article className={props.className ?? ""}>
      {props.header && <header>{props.header}</header>}
      <main>{props.children}</main>
      {props.footer && <footer>{props.footer}</footer>}
    </article>
  );
};

export const Accordian = (props: {
  children: ReactNode;
  summary: ReactNode;
  className?: string;
}) => {
  return (
    <details className={props.className ?? ""}>
      <summary>
        <div>{props.summary}</div>
      </summary>
      {props.children}
    </details>
  );
};
