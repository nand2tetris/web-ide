import {
  CSSProperties,
  Children,
  Dispatch,
  PropsWithChildren,
  ReactNode,
  SetStateAction,
  cloneElement,
  useId,
  useState,
} from "react";

export const Tab = (
  props: PropsWithChildren<{
    title: ReactNode;
    style?: CSSProperties;
    parent?: string;
    checked?: boolean;
    onSelect?: () => void;
  }>,
) => {
  const id = useId();
  const tab = `tab-${id}`;
  const panel = `panel-${id}`;
  return (
    <>
      <div role="tab" id={tab} aria-controls={panel} style={props.style}>
        <label>
          {props.title}
          <input
            type="radio"
            name={props.parent}
            aria-controls={panel}
            value={tab}
            checked={props.checked}
            onChange={(e) => e.target.checked == true && props.onSelect?.()}
          />
        </label>
      </div>
      <div role="tabpanel" id={panel} aria-labelledby={tab}>
        {props.children}
      </div>
    </>
  );
};

export const TabList = (props: {
  children: ReturnType<typeof Tab>[];
  tabIndex?: { value: number; set: Dispatch<SetStateAction<number>> };
}) => {
  const id = useId();
  const [localSelectedIndex, localSetSelectedIndex] = useState(0);

  const selectedIndex = props.tabIndex?.value ?? localSelectedIndex;
  const setSelectedIndex = props.tabIndex?.set ?? localSetSelectedIndex;

  return (
    <section
      role="tablist"
      style={{ "--tab-count": props.children.length } as React.CSSProperties}
    >
      {Children.map(props.children, (child, index) =>
        cloneElement(child, {
          checked: index === selectedIndex,
          parent: id,
          idx: index,
          onSelect: () => {
            setSelectedIndex(index);
            child.props?.onSelect?.();
          },
        }),
      )}
    </section>
  );
};
