import { useState } from "react";
import { act } from "react-dom/test-utils";
import { Bus, HIGH } from "../simulator/chip/chip";
import { Pinout, reducePin } from "./pinout";
import { render, screen } from "../testing";

describe("<Pinout />", () => {
  it("renders pins", () => {
    const pin = new Bus("pin");
    render(<Pinout pins={[reducePin(pin)]} />);

    const pinOut = screen.getByText("0");
    expect(pinOut).toBeVisible();
  });

  it("toggles bits", () => {
    const pin = new Bus("pin");
    const Wrapper = () => {
      const [pins, setPins] = useState([reducePin(pin)]);

      const toggle = () => {
        pin.toggle();
        setPins([reducePin(pin)]);
      };

      return <Pinout pins={pins} toggle={toggle} />;
    };

    render(<Wrapper />);

    const pinOut = screen.getByText("0");
    act(() => {
      pinOut.click();
    });
    expect(pin.busVoltage).toBe(HIGH);
    expect(screen.getByText("1")).toBeVisible();
  });

  it.skip("increments buses", () => {
    const pin = new Bus("pin", 3);
    const Wrapper = () => {
      const [pins, setPins] = useState([reducePin(pin)]);

      const toggle = () => {
        pin.busVoltage += 1;
        setPins([reducePin(pin)]);
      };

      return <Pinout pins={pins} toggle={toggle} />;
    };

    render(<Wrapper />);

    const pinOut = screen.getByText("000");
    act(() => {
      pinOut.click();
    });
    expect(pin.busVoltage).toBe(1);
    expect(screen.getByText("001")).toBeVisible();
  });
});
