const Events = Symbol("events");
const CLEAR = Symbol("Clear children");
function isAttrs(attrs) {
    if (!attrs) {
        return false;
    }
    if (typeof attrs === "object") {
        return !attrs.nodeType;
    }
    return false;
}
function normalizeArguments(attrs, children = [], defaultAttrs = {}) {
    let attributes;
    if (isAttrs(attrs)) {
        attributes = attrs;
    }
    else {
        if (attrs !== undefined) {
            children.unshift(attrs);
        }
        attributes = defaultAttrs;
    }
    return [attributes, children.flat()];
}
function up(element, attrs, ...children) {
    return update(element, ...normalizeArguments(attrs, children));
}
function update(element, attrs, children) {
    // Track events, to remove later
    const $events = (element[Events] ??= new Map());
    const { style = {}, events = {}, ...rest } = attrs;
    Object.entries(events).forEach(([k, v]) => {
        if (v === null && $events.has(k)) {
            const listener = $events.get(k);
            element.removeEventListener(k, listener);
        }
        else if (!$events.has(k)) {
            element.addEventListener(k, v);
            $events.set(k, v);
        }
    });
    const _style = element.style;
    if (_style) {
        if (typeof style === "string") {
            _style.cssText = style;
        }
        else {
            Object.entries(style).forEach(([k, v]) => {
                // @ts-ignore Object.entries is unable to statically look into args
                _style[k] = v;
            });
        }
    }
    Object.entries(rest).forEach(([k, v]) => {
        if (k === "class" && typeof v === "string") {
            v.split(/\s+/m)
                .filter((s) => s !== "")
                .forEach((c) => {
                if (c.startsWith("!")) {
                    element.classList.remove(c.substring(1));
                }
                else {
                    element.classList.add(c);
                }
            });
        }
        const useNamespace = element.namespaceURI &&
            element.namespaceURI != "http://www.w3.org/1999/xhtml";
        const remove = !v;
        if (useNamespace) {
            if (remove) {
                element.removeAttributeNS(element.namespaceURI, k);
            }
            else if (v === true) {
                element.setAttributeNS(element.namespaceURI, k, k);
            }
            else {
                element.setAttributeNS(element.namespaceURI, k, v);
            }
        }
        else {
            if (remove) {
                element.removeAttribute(k);
            }
            else if (v === true) {
                element.setAttribute(k, k);
            }
            else {
                element.setAttribute(k, v);
            }
        }
    });
    if (children?.length > 0) {
        if (children[0] === CLEAR) {
            element.replaceChildren();
        }
        else {
            element.replaceChildren(...children);
        }
    }
    element.update ??= (attrs, ...children) => update(element, ...normalizeArguments(attrs, children));
    return element;
}

const makeHTMLElement = (name) => (attrs, ...children) => up(document.createElement(name), attrs, ...children);
const a$1 = makeHTMLElement("a");
const article = makeHTMLElement("article");
const button = makeHTMLElement("button");
const canvas = makeHTMLElement("canvas");
const code = makeHTMLElement("code");
const dd = makeHTMLElement("dd");
const del = makeHTMLElement("del");
const details = makeHTMLElement("details");
const dialog = makeHTMLElement("dialog");
const div = makeHTMLElement("div");
const dl = makeHTMLElement("dl");
const dt = makeHTMLElement("dt");
const fieldset = makeHTMLElement("fieldset");
const figure = makeHTMLElement("figure");
const footer = makeHTMLElement("footer");
const h2 = makeHTMLElement("h2");
const header = makeHTMLElement("header");
const i = makeHTMLElement("i");
const input = makeHTMLElement("input");
const ins = makeHTMLElement("ins");
const label = makeHTMLElement("label");
const li = makeHTMLElement("li");
const main = makeHTMLElement("main");
const nav = makeHTMLElement("nav");
const ol = makeHTMLElement("ol");
const option = makeHTMLElement("option");
const p = makeHTMLElement("p");
const pre = makeHTMLElement("pre");
const section = makeHTMLElement("section");
const select = makeHTMLElement("select");
const span = makeHTMLElement("span");
const strong = makeHTMLElement("strong");
const style = makeHTMLElement("style");
const summary = makeHTMLElement("summary");
const table = makeHTMLElement("table");
const tbody = makeHTMLElement("tbody");
const td = makeHTMLElement("td");
const textarea = makeHTMLElement("textarea");
const th = makeHTMLElement("th");
const thead = makeHTMLElement("thead");
const tr = makeHTMLElement("tr");
const ul = makeHTMLElement("ul");

let registry = {};
function provide(items) {
    registry = { ...registry, ...items };
}
function retrieve(key) {
    return registry[key];
}

let baseURI = `${document.baseURI}`;
const normalizeHref = () => {
    return location.href + "/" === baseURI ? baseURI : location.href;
};
let globalRouter;
const Router = {
    for(links, index, setGlobalRouter = true) {
        let target;
        const partialRouter = (t) => {
            target = t;
            const href = normalizeHref();
            const route = href === baseURI ? baseURI + index : href;
            doNavigate(route);
            window.addEventListener("popstate", () => {
                doNavigate(location.href);
            });
            return target;
        };
        const doNavigate = (link) => {
            link = link.replace(baseURI, "") || index;
            if (link === partialRouter.current) {
                return false;
            }
            partialRouter.current = link;
            target.update((links.find(({ href }) => link.endsWith(href))?.target ??
                (() => undefined))());
            return true;
        };
        const navigate = (url) => {
            return (event) => {
                event.preventDefault();
                if (doNavigate(url || index)) {
                    history.pushState(null, "", url);
                }
            };
        };
        partialRouter.navigate = navigate;
        if (setGlobalRouter) {
            globalRouter = partialRouter;
        }
        return partialRouter;
    },
    href(link) {
        return `${baseURI}${link.replace(/^\//, "")}`;
    },
    navigate(href) {
        return globalRouter?.navigate(href);
    },
};

const link = ({ href, link }) => a$1({ href: Router.href(href), events: { click: Router.navigate(href) } }, link);

function join(...paths) {
    const pathParts = [];
    for (const path of paths) {
        for (const part of path.split("/")) {
            switch (part) {
                case "":
                case ".":
                    break;
                case "..":
                    pathParts.pop();
                    break;
                default:
                    pathParts.push(part);
            }
        }
    }
    return "/" + pathParts.join("/");
}
class FileSystem {
    adapter;
    wd = "/";
    stack = [];
    constructor(adapter = new ObjectFileSystemAdapter()) {
        this.adapter = adapter;
    }
    cwd() {
        return this.wd;
    }
    cd(dir) {
        this.wd = this.p(dir);
    }
    pushd(dir) {
        this.stack.push(this.wd);
        this.cd(dir);
    }
    popd() {
        if (this.stack.length > 0) {
            this.wd = this.stack.pop();
        }
    }
    stat(path) {
        return this.adapter.stat(join(this.cwd(), path));
    }
    readdir(path) {
        return this.adapter.readdir(this.p(path) + "/");
    }
    copyFile(from, to) {
        return this.adapter.copyFile(this.p(from), this.p(to));
    }
    readFile(path) {
        return this.adapter.readFile(this.p(path));
    }
    writeFile(path, contents) {
        return this.adapter.writeFile(this.p(path), contents);
    }
    rm(path) {
        return this.adapter.rm(this.p(path));
    }
    p(path) {
        return path[0] == "/" ? path : join(this.cwd(), path);
    }
}
class ObjectFileSystemAdapter {
    fs;
    constructor(fs = {}) {
        this.fs = fs;
    }
    stat(path) {
        return new Promise((resolve, reject) => {
            if (this.fs[path] != null) {
                resolve({
                    isDirectory() {
                        return false;
                    },
                    isFile() {
                        return true;
                    },
                });
            }
            else {
                reject();
            }
        });
    }
    readdir(path) {
        return new Promise((resolve) => {
            let dir = [];
            for (const filename of Object.keys(this.fs)) {
                if (filename.startsWith(path)) {
                    const end = filename.indexOf("/", path.length + 1);
                    const basename = filename.substring(path.length, end == -1 ? undefined : end);
                    dir.push(basename);
                }
            }
            return resolve(dir);
        });
    }
    copyFile(from, to) {
        return new Promise((resolve) => {
            this.fs[to] = this.fs[from];
            resolve();
        });
    }
    readFile(path) {
        return new Promise((resolve, reject) => {
            let file = this.fs[path];
            if (file === undefined) {
                reject();
            }
            else {
                resolve(file);
            }
        });
    }
    writeFile(path, contents) {
        return new Promise((resolve) => {
            this.fs[path] = contents;
            resolve();
        });
    }
    rm(path) {
        return new Promise((resolve) => {
            delete this.fs[path];
            resolve();
        });
    }
}
class LocalStorageFileSystemAdapter extends ObjectFileSystemAdapter {
    constructor() {
        super(window.localStorage);
    }
}
async function reset(fs, tree) {
    for (const [path, file] of Object.entries(tree)) {
        if (typeof file == "string") {
            await fs.writeFile(path, file);
        }
        else {
            fs.cd(path);
            await reset(fs, file);
            fs.cd("..");
        }
    }
}

const isDisplay = (/** @type unknown */ a) => typeof a.toString === "function" ||
    typeof a === "string";
const display = (a) => {
    if (isDisplay(a)) {
        const str = a.toString();
        if (str === "[object Object]")
            return JSON.stringify(a);
        return str;
    }
    return JSON.stringify(a);
};

const Select$1 = (attrs) => label({ style: attrs.style ?? {} }, select({ events: attrs.events ?? {} }, ...prepareOptions(attrs.options, attrs.selected).map(Option)));
const prepareOptions = (attrs, selected) => Array.isArray(attrs)
    ? attrs.map((value) => ({
        value,
        label: value,
        selected: selected == value,
    }))
    : Object.entries(attrs).map(([value, label]) => typeof label === "string"
        ? { value, label, selected: selected === value }
        : { value, ...label });
const Option = (attrs) => option(attrs);
const Dropdown = (attrs, ...options) => Select$1({
    ...attrs,
    options: typeof options[0] == "string" ? options : options[0],
});

function dashCase(identifier) {
    return identifier
        .replace(/([a-z])([A-Z])/g, (_, a, b) => `${a}-${b.toLowerCase()}`)
        .replace(/ ([A-Z])/g, (_, b) => `-${b.toLowerCase()}`);
}

function compileFStyle(fstyle, prefix = "") {
    const properties = [];
    const rules = [];
    for (const [key, value] of Object.entries(fstyle)) {
        if (typeof value == "string") {
            properties.push({ key, value });
        }
        else {
            rules.push({ key, value });
        }
    }
    let rule = "";
    if (properties.length > 0) {
        rule += `${prefix} {\n`;
        for (const { key, value } of properties) {
            rule += `  ${dashCase(key)}: ${value};\n`;
        }
        rule += "}\n\n";
    }
    for (const { key, value } of rules) {
        if (key.startsWith("@media")) {
            rule += `${key} {\n`;
            rule += compileFStyle(value, "  ");
            rule += `}\n\n`;
        }
        else {
            rule += compileFStyle(value, `${prefix} ${key}`);
        }
    }
    return rule;
}

const isNone = (s) => s == null;
const isOk = (t) => t.ok !== undefined;
const isErr = (e) => e.err !== undefined;
function Ok(t) {
    return t.ok
        ? t.ok
        : {
            ok: t,
            map(fn) {
                return fn(Ok(this));
            },
        };
}
function Err(e) {
    return (e.err ?? {
        err: e,
        map(_fn) {
            return this;
        },
    });
}
function unwrap(t) {
    if (isNone(t)) {
        throw new Error(`Attempted to unwrap None`);
    }
    if (isErr(t)) {
        throw Err(t);
    }
    if (isOk(t)) {
        return Ok(t);
    }
    return t;
}
function unwrapOr(t, def) {
    if (isNone(t)) {
        return def;
    }
    if (isErr(t)) {
        return def;
    }
    if (isOk(t)) {
        return Ok(t);
    }
    return t;
}

const State = Symbol();
function FC(name, component) {
    class FCImpl extends HTMLElement {
        constructor() {
            super();
        }
        [State] = {};
        #attrs = {};
        #children = [];
        update(attrs, ...children) {
            [attrs, children] = normalizeArguments(attrs, children);
            if (children[0] === CLEAR) {
                this.#children = [];
            }
            else if (children.length > 0) {
                this.#children = children;
            }
            this.#attrs = { ...this.#attrs, ...attrs };
            // Apply updates from the attrs to the dom node itself
            // @ts-ignore
            update(this, this.#attrs, []);
            // Re-run the component function using new element, attrs, and children.
            const replace = [component(this, this.#attrs, this.#children)];
            this.replaceChildren(...replace.flat());
            return this;
        }
    }
    customElements.define(name, FCImpl);
    const ctor = (attrs, ...children) => {
        const element = document.createElement(name);
        element.update(attrs, ...children);
        return element;
    };
    return ctor;
}

const Hex = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
];
function chars$1(i) {
    return Hex[i] ?? "X";
}
function bits(i) {
    switch (i) {
        case 0x0:
            return "0000";
        case 0x1:
            return "0001";
        case 0x2:
            return "0010";
        case 0x3:
            return "0011";
        case 0x4:
            return "0100";
        case 0x5:
            return "0101";
        case 0x6:
            return "0110";
        case 0x7:
            return "0111";
        case 0x8:
            return "1000";
        case 0x9:
            return "1001";
        case 0xa:
            return "1010";
        case 0xb:
            return "1011";
        case 0xc:
            return "1100";
        case 0xd:
            return "1101";
        case 0xe:
            return "1110";
        case 0xf:
            return "1111";
        default:
            return "erro";
    }
}
function int(n, radix) {
    let i = parseInt(n.replace(/[^\d+-.xa-fA-F]/g, ""), radix);
    i = i & 0xffff;
    if (i & 0x8000) {
        return -((~i + 1) & 0xffff);
    }
    return i;
}
function int16(i) {
    return int(i, 16);
}
function int10(i) {
    return int(i, 10);
}
function int2(i) {
    return int(i, 2);
}
function hex(i) {
    const hu = chars$1((i & 0xf000) >> 12);
    const hl = chars$1((i & 0x0f00) >> 8);
    const lu = chars$1((i & 0x00f0) >> 4);
    const ll = chars$1(i & 0x000f);
    return `0x${hu}${hl}${lu}${ll}`;
}
function bin(i, precision = 16) {
    const hu = bits((i & 0xf000) >> 12);
    const hl = bits((i & 0x0f00) >> 8);
    const lu = bits((i & 0x00f0) >> 4);
    const ll = bits(i & 0x000f);
    // return `${hu} ${hl} ${lu} ${ll}`;
    return `${hu}${hl}${lu}${ll}`.substring(16 - precision); // Match the book's formatting
}
function dec(i) {
    const s = Math.sign(i) === -1 ? "-" : "";
    i = Math.abs(i);
    return `${s}${i}`;
}
function nand16(a, b) {
    a = a & 0xffff;
    b = b & 0xffff;
    let c = ~(a & b);
    c = c & 0xffff;
    return c;
}

const Pinout = FC("pin-out", (el, { pins, toggle }) => {
    const t = table(thead(tr(th({ tabIndex: 0 }, "Name"), th({ tabIndex: 0 }, "Voltage"))), tbody(...[...pins.entries()].map((pin) => tr(td({ tabIndex: 0 }, pin.name), td({
        style: { cursor: toggle ? "pointer" : "inherit" },
        events: {
            ...(toggle
                ? { click: () => toggle(pin), keypress: () => toggle(pin) }
                : {}),
        },
    }, code({ tabIndex: 0 }, pin.width == 1
        ? pin.voltage() == 0
            ? "Low"
            : "High"
        : bin(pin.busVoltage, pin.width)))))));
    return t;
});

const Select = FC("jiffies-select", (el, { name, events: { change }, disabled, value, options }) => select({ name, events: { change }, disabled }, ...options.map(([v, name]) => option({ value: v, selected: value === v }, `${name}`))));

const icon = (icon) => i({ class: `icon-${icon}` });
const Runbar = FC("run-bar", (el, { runner }, children) => div({ class: "input-group" }, a$1({
    href: "#",
    role: "button",
    events: {
        click: (e) => {
            e.preventDefault();
            runner.frame();
        },
    },
}, icon("fast-fw")), a$1({
    role: "button",
    events: {
        click: (e) => {
            e.preventDefault();
            runner.reset();
        },
    },
}, icon(`to-start`)), a$1({
    role: "button",
    events: {
        click: (e) => {
            e.preventDefault();
            runner.running ? runner.stop() : runner.start();
        },
    },
}, runner.running ? icon(`pause`) : icon(`play`)), Select({
    name: "speed",
    events: {
        change: (e) => {
            runner.speed = Number(e.target?.value ?? runner.speed);
        },
    },
    disabled: runner.running,
    value: `${runner.speed}`,
    options: [
        ["16", "60FPS"],
        ["500", "Fast"],
        ["1000", "Normal"],
        ["2000", "Slow"],
    ],
}), Select({
    name: "steps",
    events: {
        change: (e) => {
            runner.steps = Number(e.target?.value ?? runner.steps);
        },
    },
    disabled: runner.running,
    value: `${runner.steps}`,
    options: [
        ["1", "1 Step"],
        ["500", "500"],
        ["1000", "1000"],
        ["2000", "2000"],
    ],
}), ...children));

/**
 * Throw an error when a condition is not met.
 */
function assert(condition, message = "Assertion failed") {
    if (!condition) {
        throw new Error(message instanceof Function ? message() : message);
    }
}
/**
 * Given a value, return it if it is not null nor undefined. Otherwise throw an
 * error.
 *
 * @template T
 * @returns {NonNullable<T>}
 */
function assertExists(t, message = "Assertion failed: value does not exist") {
    assert(t != null, message);
    return t;
}

function range(start, end, stride = 1) {
    const range = [];
    for (let i = start; i < end; i += stride) {
        range.push(i);
    }
    return range;
}

const HIGH = 1;
const LOW = 0;
class Bus {
    name;
    width;
    state;
    next = [];
    constructor(name, width = 1) {
        this.name = name;
        this.width = width;
        this.state = range(0, this.width).map(() => 0);
    }
    connect(next) {
        this.next.push(next);
        next.busVoltage = this.busVoltage;
    }
    pull(voltage, bit = 0) {
        assert(bit >= 0 && bit < this.width);
        this.state[bit] = voltage;
        this.next.forEach((n) => n.pull(voltage, bit));
    }
    voltage(bit = 0) {
        assert(bit >= 0 && bit < this.width);
        return this.state[bit];
    }
    set busVoltage(voltage) {
        for (const i of range(0, this.width)) {
            this.state[i] = ((voltage & (1 << i)) >> i);
        }
        this.next.forEach((n) => (n.busVoltage = this.busVoltage));
    }
    get busVoltage() {
        return range(0, this.width).reduce((b, i) => b | (this.state[i] << i), 0);
    }
    toggle(bit = 0) {
        const nextVoltage = this.voltage(bit) == LOW ? HIGH : LOW;
        this.pull(nextVoltage, bit);
    }
}
class InSubBus extends Bus {
    bus;
    start;
    width;
    constructor(bus, start, width = 1) {
        super(bus.name);
        this.bus = bus;
        this.start = start;
        this.width = width;
        assert(start >= 0 && start + width <= bus.width, `Mismatched InSubBus dimensions`);
        this.connect(bus);
    }
    pull(voltage, bit = 0) {
        assert(bit >= 0 && bit < this.width);
        this.bus.pull(voltage, this.start + bit);
    }
    voltage(bit = 0) {
        assert(bit >= 0 && bit < this.width);
        return this.bus.voltage(this.start + bit);
    }
    set busVoltage(voltage) {
        const high = this.bus.busVoltage & ~mask(this.width + this.start);
        const low = this.bus.busVoltage & mask(this.start);
        const mid = (voltage & mask(this.width)) << this.start;
        this.bus.busVoltage = high | mid | low;
    }
    get busVoltage() {
        return (this.bus.busVoltage >> this.start) & mask(this.width);
    }
    connect(bus) {
        assert(this.start + this.width <= bus.width, `Mismatched InSubBus connection dimensions`);
        this.bus = bus;
    }
}
class OutSubBus extends Bus {
    bus;
    start;
    width;
    constructor(bus, start, width = 1) {
        super(bus.name);
        this.bus = bus;
        this.start = start;
        this.width = width;
        assert(start >= 0 && width <= bus.width, `Mismatched OutSubBus dimensions`);
        this.connect(bus);
    }
    set busVoltage(voltage) {
        this.bus.busVoltage =
            (voltage & mask(this.width + this.start)) >> this.start;
    }
    get busVoltage() {
        return this.bus.busVoltage & mask(this.width);
    }
    connect(bus) {
        assert(this.width <= bus.width, `Mismatched OutSubBus connection dimensions`);
        this.bus = bus;
    }
}
class ConstantBus extends Bus {
    value;
    constructor(name, value) {
        super(name, 16 /* TODO: get high bit index */);
        this.value = value;
    }
    pullHigh(_ = 0) { }
    pullLow(_ = 0) { }
    voltage(_ = 0) {
        return (this.busVoltage & 0x1);
    }
    set busVoltage(voltage) {
        // Noop
    }
    get busVoltage() {
        return this.value;
    }
}
const TRUE_BUS = new ConstantBus("true", 0xffff);
const FALSE_BUS = new ConstantBus("false", 0);
function parsePinDecl(toPin) {
    const { pin, w } = toPin.match(/(?<pin>[a-z]+)(\[(?<w>\d+)\])?/)?.groups;
    return {
        pin,
        width: w ? Number(w) : 1,
    };
}
function parseToPin(toPin) {
    const { pin, i, j } = toPin.match(/(?<pin>[a-z]+)(\[(?<i>\d+)(\.\.(?<j>\d+))?\])?/)?.groups;
    return {
        pin,
        start: i ? Number(i) : undefined,
        end: j ? Number(j) : undefined,
    };
}
class Pins {
    map = new Map();
    insert(pin) {
        let { name } = pin;
        assert(!this.map.has(name), `Pins already has ${name}!`);
        this.map.set(name, pin);
    }
    emplace(name, minWidth) {
        if (this.has(name)) {
            return this.get(name);
        }
        else {
            const pin = new Bus(name, minWidth);
            this.insert(pin);
            return pin;
        }
    }
    has(pin) {
        return this.map.has(pin);
    }
    get(pin) {
        return this.map.get(pin);
    }
    entries() {
        return this.map.values();
    }
}
let id = 0;
class Chip$1 {
    name;
    id = id++;
    ins = new Pins();
    outs = new Pins();
    pins = new Pins();
    parts = new Set();
    constructor(ins, outs, name) {
        this.name = name;
        for (const inn of ins) {
            const { pin, width = 1 } = inn.pin !== undefined
                ? inn
                : parsePinDecl(inn);
            this.ins.insert(new Bus(pin, width));
        }
        for (const out of outs) {
            const { pin, width = 1 } = out.pin !== undefined
                ? out
                : parsePinDecl(out);
            this.outs.insert(new Bus(pin, width));
        }
    }
    in(pin = "in") {
        assert(this.ins.has(pin));
        return this.ins.get(pin);
    }
    out(pin = "out") {
        assert(this.outs.has(pin));
        return this.outs.get(pin);
    }
    pin(name) {
        assert(this.pins.has(name));
        return this.pins.get(name);
    }
    get(name) {
        if (this.ins.has(name)) {
            return this.ins.get(name);
        }
        if (this.outs.has(name)) {
            return this.outs.get(name);
        }
        if (this.pins.has(name)) {
            return this.pins.get(name);
        }
        return undefined;
    }
    isOutPin(pin) {
        return this.outs.has(pin);
    }
    wire(part, connections) {
        this.parts.add(part);
        for (const { to, from } of connections) {
            if (part.isOutPin(to.name)) {
                this.wireOutPin(part, to, from);
            }
            else {
                this.wireInPin(part, to, from);
            }
        }
    }
    findPin(from, minWidth) {
        if (from.toLowerCase() === "true" || from === "1") {
            return TRUE_BUS;
        }
        if (from.toLowerCase() === "false" || from === "0") {
            return FALSE_BUS;
        }
        if (this.ins.has(from)) {
            return this.ins.get(from);
        }
        if (this.outs.has(from)) {
            return this.outs.get(from);
        }
        return this.pins.emplace(from, minWidth);
    }
    wireOutPin(part, to, from) {
        let partPin = assertExists(part.outs.get(to.name), () => `Cannot wire to missing pin ${to.name}`);
        let chipPin = this.findPin(from.name, from.width);
        to.width ??= partPin.width;
        from.width ??= chipPin.width;
        if (chipPin instanceof ConstantBus) {
            throw new Error(`Cannot wire to constant bus`);
        }
        // Wrap the chipPin in an InBus when the chip side is dimensioned
        if (from.start > 0 || from.width != chipPin.width) {
            chipPin = new InSubBus(chipPin, from.start, from.width);
        }
        // Wrap the chipPin in an OutBus when the part side is dimensionsed
        if (to.start > 0 || to.width != chipPin.width) {
            chipPin = new OutSubBus(chipPin, to.start, to.width);
        }
        partPin.connect(chipPin);
    }
    wireInPin(part, to, from) {
        let partPin = assertExists(part.ins.get(to.name), () => `Cannot wire to missing pin ${to.name}`);
        const chipPin = this.findPin(from.name, to.width);
        to.width ??= partPin.width;
        from.width ??= chipPin.width;
        // Wrap the partPin in an InBus when the part side is dimensioned
        if (to.start > 0 || to.width != chipPin.width) {
            partPin = new InSubBus(partPin, to.start, to.width);
        }
        // Wrap the partPin in an OutBus when the chip side is dimensioned
        if (!["true", "false"].includes(chipPin.name)) {
            if (from.start > 0 || from.width != chipPin.width) {
                partPin = new OutSubBus(partPin, from.start, from.width);
            }
        }
        chipPin.connect(partPin);
    }
    eval() {
        for (const chip of this.parts) {
            // TODO topological sort
            // eval chip input busses
            chip.eval();
            // eval output busses
        }
    }
    tick() {
        this.eval();
    }
    tock() {
        this.eval();
    }
}
class Low extends Chip$1 {
    constructor() {
        super([], []);
        this.outs.insert(FALSE_BUS);
    }
}
class DFF extends Chip$1 {
    t = LOW;
    constructor() {
        super(["in"], ["out"]);
    }
    tick() {
        // Read in into t
        this.t = this.in().voltage();
        this.eval();
    }
    tock() {
        // write t into out
        this.out().pull(this.t);
        this.eval();
    }
}
function mask(width) {
    return Math.pow(2, width) - 1;
}
function setBus(busses, pin) {
    busses[pin.name] = bin((pin.busVoltage & mask(pin.width)) <<
        pin.start ?? 0);
    return busses;
}
function printChip(chip) {
    return {
        id: chip.id,
        name: chip.name ?? chip.constructor.name,
        ins: [...chip.ins.entries()].reduce(setBus, {}),
        outs: [...chip.outs.entries()].reduce(setBus, {}),
        pins: [...chip.pins.entries()].reduce(setBus, {}),
        children: [...chip.parts.values()].map(printChip),
    };
}

const MAX_STEPS = 1000;
class Timer {
    frame() {
        this.tick();
        this.finishFrame();
    }
    tick() { }
    finishFrame() { }
    reset() { }
    toggle() { }
    steps = 1; // How many steps to take per update
    speed = 1000; // how often to update, in ms
    get running() {
        return this.#running;
    }
    #running = false;
    #sinceLastFrame = 0;
    #lastUpdate = 0;
    #run = () => {
        if (!this.#running) {
            return;
        }
        const now = Date.now();
        const delta = now - this.#lastUpdate;
        this.#lastUpdate = now;
        this.#sinceLastFrame += delta;
        if (this.#sinceLastFrame > this.speed) {
            for (let i = 0; i < Math.min(this.steps, MAX_STEPS); i++) {
                this.tick();
            }
            this.finishFrame();
            this.#sinceLastFrame -= this.speed;
        }
        requestAnimationFrame(this.#run);
    };
    start() {
        this.#running = true;
        this.#lastUpdate = Date.now() - this.speed;
        this.#run();
        this.toggle();
    }
    stop() {
        this.#running = false;
        this.toggle();
    }
}

// https://docs.rs/nom/latest/nom/index.html
class ParseError {
    context;
    name = "ParseError";
    constructor(context) {
        this.context = context;
    }
    toString(indent = "") {
        const { message, span, cause } = this.context ?? {};
        let str = indent + this.name;
        if (message) {
            str = `${str} (${message})`;
        }
        if (span instanceof Span) {
            str = `${str} [${span.pos}; ${span.line},${span.col}]`;
        }
        if (span) {
            if (span.length > 15) {
                str = `${str} at ${span.substring(0, 15)}...`;
            }
            else {
                str = `${str} at '${span}'`;
            }
        }
        if (cause) {
            if (cause instanceof ParseError) {
                str = `${str}\n${indent}Cause:\n${cause.toString(indent + "  ")}`;
            }
            else {
                str = `${str}\n${indent}Cause:\n${indent}  ${cause}`;
            }
        }
        return str;
    }
}
class Span {
    str;
    start;
    end;
    pos = 0;
    line = 1;
    col = 1;
    get length() {
        return this.end - this.start;
    }
    constructor(str, start = 0, end = str.length - start) {
        this.str = str;
        this.start = start;
        this.end = end;
        assert(end <= str.length, "Creating Span longer than underlying StringLike");
        if (str instanceof Span) {
            this.pos = str.pos + start;
            this.line = str.line;
            this.col = str.col;
        }
        else {
            this.pos = start;
        }
        for (let i = 0; i < this.start; i++) {
            this.col += 1;
            if (this.str.charAt(i) == "\n") {
                this.line += 1;
                this.col = 1;
            }
        }
    }
    charAt(n) {
        return this.str.charAt(this.start + n);
    }
    indexOf(input) {
        return this.toString().indexOf(input.toString());
    }
    toString() {
        return this.str.toString().substring(this.start, this.end);
    }
    substring(start, end = this.length) {
        assert(start >= 0, "Cannot use negative substring");
        assert(end >= start);
        return new Span(this, start, end);
    }
}
/** Error indicating how much input is necessary */
class ParseIncomplete extends ParseError {
    needed;
    name = "Parse Incomplete";
    constructor(needed, context) {
        super(context);
        this.needed = needed;
    }
}
/** Unrecoverable error */
class ParseFailure extends ParseError {
    name = "Parse Failure";
}
const ParseErrors = {
    error(message, context) {
        return Err(new ParseError({ message, ...context }));
    },
    failure(message, context) {
        return Err(new ParseFailure({ message, ...context }));
    },
    incomplete(n, context) {
        return Err(new ParseIncomplete(n, context));
    },
};

// https://docs.rs/nom/latest/nom/branch/index.html
// Tests a list of parsers one by one until one succeeds.
const alt = (...parsers) => (i) => {
    for (const parser of parsers) {
        const result = parser(i);
        if (isOk(result)) {
            return result;
        }
    }
    return ParseErrors.error("alt did not match any branches.", { span: i });
};
// permutation	Applies a list of parsers in any order.

// tag_no_case	Recognizes a case insensitive pattern.
// take_till	Returns the longest input slice (if any) till a predicate is met.
// take_till1	Returns the longest (at least 1) input slice till a predicate is met.
// take_until1	Returns the non empty input slice up to the first occurrence of the pattern.
// take_while	Returns the longest input slice (if any) that matches the predicate.
// take_while1	Returns the longest (at least 1) input slice that matches the predicate.
// take_while_m_n	Returns the longest (m <= len <= n) input slice that matches the predicate.
// Returns an input slice containing the first N input elements (Input[..N]).
const take = (n) => {
    const take = (i) => {
        if (i.length < n) {
            return ParseErrors.incomplete(n - i.length, { span: i });
        }
        const o = i.substring(0, n);
        i = i.substring(n);
        return Ok([i, o]);
    };
    return take;
};
// Returns the input slice up to the first occurrence of the pattern.
const take_until = (p) => {
    const take_until = (i) => {
        let o = "";
        let noInput = i.length == 0;
        while (isErr(p(i))) {
            o += i.substring(0, 1);
            i = i.substring(1);
            if (i.length == 0) {
                if (noInput) {
                    return ParseErrors.failure("take_until went past end of input", {
                        span: i,
                    });
                }
                else {
                    noInput = true;
                }
            }
        }
        return Ok([i, o]);
    };
    return take_until;
};
// Recognizes a pattern
const tag = (s) => {
    const tag = typeof s == "string"
        ? (i) => i.indexOf(s) === 0
            ? Ok([i.substring(s.length), s])
            : ParseErrors.error("tag not found", {
                cause: `tag '${s}'`,
                span: i,
            })
        : (i) => {
            let m = i.toString().match(s);
            if (m == null)
                return ParseErrors.error("tag did not match", {
                    cause: `tag ${s}`,
                    span: i,
                });
            let o = m[0];
            return Ok([i.substring(o.length), i.substring(0, o.length)]);
        };
    return tag;
};

// https://docs.rs/nom/latest/nom/combinator/index.html
// Returns its input if it is at the end of input data
const eof = () => (i) => i == "" ? Ok(["", null]) : ParseErrors.error("Not EOF");
// cond	Calls the parser if the condition is met.
// consumed	if the child parser was successful, return the consumed input with the output as a tuple. Functions similarly to recognize except it returns the parser output as well.
// flat_map	Creates a new parser from the output of the first parser, then apply that parser over the rest of the input.
// Maps a function on the result of a parser.
const map = (p, fn) => {
    const map = (i) => {
        const res = p(i);
        if (isErr(res))
            return res;
        const [input, o] = Ok(res);
        return Ok([input, fn(o)]);
    };
    return map;
};
// map_opt	Applies a function returning an Option over the result of a parser.
// Applies a parser over the result of another one.
const mapParser = (p1, p2) => {
    return map(p1, (i) => {
        const res = p2(i);
        if (isErr(res))
            throw res;
        return Ok(res)[1];
    });
};
// map_res	Applies a function returning a Result over the result of a parser.
// not	Succeeds if the child parser returns an error.
// Optional parser: Will return None if not successful.
const opt = (p) => {
    const opt = (i) => {
        const result = p(i);
        return isErr(result) ? Ok([i, null]) : result;
    };
    return opt;
};
// peek	Tries to apply its parser without consuming the input.
// recognize	If the child parser was successful, return the consumed input as produced value.
const recognize = (p) => {
    const recognize = (i) => {
        const res = p(i);
        if (isErr(res))
            return res;
        const [inp, _] = Ok(res);
        const idx = i.length - inp.length;
        return Ok([inp, i.substring(0, idx)]);
    };
    return recognize;
};
// value	Returns the provided value if the child parser succeeds.
const value = (o, parser) => {
    const valueParser = valueFn(() => o, parser);
    const value = (i) => valueParser(i);
    return value;
};
// Returns the result of the provided function if the child parser succeeds.
const valueFn = (o, parser) => {
    const valueFnParser = map(parser, () => o());
    const valueFn = (i) => valueFnParser(i);
    return valueFn;
};
// verify	Returns the result of the child parser if it satisfies a verification function.

// https://docs.rs/nom/latest/nom/multi/index.html
// repeat	Runs the embedded parser a specified number of times. Returns the results in a Vec.
// fold_many0	Applies a parser until it fails and accumulates the results using a given function and initial value.
// fold_many1	Applies a parser until it fails and accumulates the results using a given function and initial value. Fails if the embedded parser does not succeed at least once.
// fold_many_m_n	Applies a parser n times or until it fails and accumulates the results using a given function and initial value. Fails if the embedded parser does not succeed at least m times.
// length_count	Gets a number from the first parser, then applies the second parser that many times.
// length_data	Gets a number from the parser and returns a subslice of the input of that size. If the parser returns Incomplete, length_data will return an error.
// length_value	Gets a number from the first parser, takes a subslice of the input of that size, then applies the second parser on that subslice. If the second parser returns Incomplete, length_value will return an error.
// Repeats the embedded parser max times or until it fails and returns the results in a Vec. Fails if the embedded parser does not succeed at least min times.
const many = (parser, min = 0, max = Number.MAX_SAFE_INTEGER) => {
    const many = (i) => {
        const results = [];
        while (results.length < max && i.length > 0) {
            const result = parser(i);
            if (isErr(result)) {
                break;
            }
            else {
                const [_i, _o] = Ok(result);
                results.push(_o);
                i = _i;
            }
        }
        if (results.length < min) {
            return ParseErrors.incomplete(results.length, {
                cause: "many did not find enough results",
                span: i,
            });
        }
        else {
            return Ok([i, results]);
        }
    };
    return many;
};
// Repeats the embedded parser until it fails and returns the results in a Vec.
const many0 = (parser) => many(parser, 0);
// Repeats the embedded parser until it fails and returns the number of successful iterations.
// export const many0_count = (parser: Parser) => count(many0(parser));
// Runs the embedded parser until it fails and returns the results in a Vec. Fails if the embedded parser does not produce at least one result.
const many1 = (parser) => many(parser, 1);
// Repeats the embedded parser until it fails and returns the number of successful iterations. Fails if the embedded parser does not succeed at least once.
// export const many1_times = (parser: Parser) => times(many1(parser));
// many_till	Applies the parser f until the parser g produces a result. Returns a pair consisting of the results of f in a Vec and the result of g.
// separated_list0	Alternates between two parsers to produce a list of elements.
// separated_list1	Alternates between two parsers to produce a list of elements. Fails if the element parser does not produce at least one element.

// Tests if byte is ASCII alphabetic: A-Z, a-z
const is_ascii = (i) => ("A" <= i && i <= "Z") || ("a" <= i && i <= "z");
// Tests if byte is extended alphabetic
// TODO(https://stackoverflow.com/a/26660334/240358)
const is_alphabetic = (i) => is_ascii(i);
// Tests if byte is ASCII alphanumeric: A-Z, a-z, 0-9
const is_alphanumeric = (i) => is_ascii(i) || is_digit(i);
// Tests if byte is ASCII digit: 0-9
const is_digit = (i) => "0" <= i && i <= "9";
const is_crlf = (i) => i == "\n" || i == "\r";
// Tests if byte is ASCII space or tab
const is_space = (i) => i == " " || i == "\t";
const chars = (charClass, min) => {
    const chars = (i) => {
        let d = 0;
        const m = i.toString();
        while (d < m.length && charClass(m[d]))
            d++;
        if (d < min) {
            return ParseErrors.incomplete(min - d, { span: i });
        }
        return Ok([i.substring(d), i.substring(0, d)]);
    };
    return chars;
};
// https://docs.rs/nom/latest/nom/character/complete/index.html
const alpha = (min) => chars(is_alphabetic, min);
// alpha1	Recognizes one or more lowercase and uppercase ASCII alphabetic characters: a-z, A-Z
const alpha1 = () => alpha(1);
const alphanumeric = (min) => chars(is_alphanumeric, min);
// Recognizes one or more ASCII numerical and alphabetic characters: 0-9, a-z, A-Z
const alphanumeric1 = () => alphanumeric(1);
// Recognizes the string “\r\n”.
const crlf = () => tag("\r\n");
const digit = (min) => chars(is_digit, min);
// Recognizes one or more ASCII numerical characters: 0-9
const digit1 = () => digit(1);
// hex_digit0	Recognizes zero or more ASCII hexadecimal numerical characters: 0-9, A-F, a-f
// hex_digit1	Recognizes one or more ASCII hexadecimal numerical characters: 0-9, A-F, a-f
// integer  Parsers a number in text form to an integer number
const multispace = (min) => {
    const parser = chars((i) => is_space(i) || is_crlf(i), min);
    const multispace = (i) => parser(i);
    return multispace;
};
// Recognizes zero or more spaces, tabs, carriage returns and line feeds.
const multispace0 = () => multispace(0);
// Recognizes one or more spaces, tabs, carriage returns and line feeds.
const multispace1 = () => multispace(1);
// newline	Matches a newline character ‘\n’.
const newline = () => tag("\n");
// Recognizes an end of line (both ‘\n’ and ‘\r\n’).
const line_ending_parser = alt(newline(), crlf());
const line_ending = () => {
    const line_ending = (i) => line_ending_parser(i);
    return line_ending;
};
// none_of	Recognizes a character that is not in the provided characters.
// not_line_ending	Recognizes a string of any char except ‘\r\n’ or ‘\n’.
// number	Parses a number in text form to a number
// oct_digit0	Recognizes zero or more octal characters: 0-7
// oct_digit1	Recognizes one or more octal characters: 0-7
// one_of	Recognizes one of the provided characters.
// satisfy	Recognizes one character and checks that it satisfies a predicate
// space0	Recognizes zero or more spaces and tabs.
// space1	Recognizes one or more spaces and tabs.
// tab	Matches a tab character ‘\t’.

// delimited	Matches an object from the first parser and discards it, then gets an object from the second parser, and finally matches an object from the third parser and discards it.
const delimited = (a, p, b) => map(tuple(a, p, b), ([_, o]) => o);
// Gets an object from the first parser, then gets another object from the second parser.
const pair = (a, b) => tuple(a, b);
// preceded	Matches an object from the first parser and discards it, then gets an object from the second parser.
const preceded = (a, b) => map(tuple(a, b), ([_, o]) => o);
// separated_pair	Gets an object from the first parser, then matches an object from the sep_parser and discards it, then gets another object from the second parser.
const separated = (a, b, c) => map(tuple(a, b, c), ([o1, _, o2]) => [o1, o2]);
// terminated	Gets an object from the first parser, then matches an object from the second parser and discards it.
const terminated = (a, b) => map(tuple(a, b), ([o, _]) => o);
function tuple(...parsers) {
    const tuple = (i) => {
        const results = [];
        for (const parser of parsers) {
            const result = parser(i);
            if (isErr(result))
                return result;
            // @ts-ignore
            const [input, o] = Ok(result);
            results.push(o);
            i = input;
        }
        return Ok([i, results]);
    };
    return tuple;
}

const line = () => terminated(take_until(alt(line_ending(), value("", eof()))), opt(line_ending()));
// Wrapper combinators that eat whitespace before and after a parser
const ws = (inner, ws = multispace0) => delimited(ws(), inner, ws());
// C++/EOL style comments
const eolComment = (start) => {
    const eolCommentParser = recognize(tuple(tag(start), tag(/[^\r\n]*(?:\r\n|\n)?/)));
    const eolComment = (i) => eolCommentParser(i);
    return eolComment;
};
// C-style comments
const comment = (open, close) => {
    const commentParser = recognize(tuple(tag(open), take_until(tag(close)), tag(close)));
    const comment = (i) => commentParser(i);
    return comment;
};
// Eat white space and comments
const filler = (start = "//", open = "/*", close = "*/") => {
    const fillerParser = recognize(many0(alt(multispace1(), comment(open, close), eolComment(start))));
    const filler = (i) => fillerParser(i);
    return filler;
};
function token(tokenP, fill = filler) {
    const tokenParser = tokenP instanceof RegExp || typeof tokenP == "string"
        ? ws(tag(tokenP), fill)
        : ws(tokenP, fill);
    const token = (i) => tokenParser(i);
    return token;
}
// C-style identifiers
const identifier = (initial = alt(alpha1(), tag("_")), rest = alt(alphanumeric1(), tag("_"))) => {
    const identifierParser = recognize(pair(initial, many0(rest)));
    const identifier = (i) => identifierParser(i);
    return identifier;
};
// escaped_string   https://github.com/Geal/nom/blob/main/examples/string.rs
// hexadecimal  0x... or 0X...
// binary   0b... or 0B...
// decimal
// float
// number  https://tc39.es/ecma262/multipage/ecmascript-language-lexical-grammar.html#prod-NumericLiteral
const list = (parser, separator) => {
    const listParser = terminated(map(tuple(parser, many0(preceded(separator, parser))), ([a, rest]) => [
        a,
        ...rest,
    ]), opt(separator));
    const list = (i) => listParser(i);
    return list;
};

/** Reads and parses HDL chip descriptions. */
const hdlWs = (p) => {
    const parser = ws(p, filler);
    const hdlWs = (i) => parser(i);
    return hdlWs;
};
const hdlIdentifierParser = hdlWs(identifier());
const hdlIdentifier = (i) => 
// @ts-ignore
hdlIdentifierParser(i).map(([rest, id]) => Ok([rest, id.toString()]));
function pinDeclaration(toPin) {
    const match = toPin.toString().match(/^(?<pin>[0-9a-z]+)(\[(?<w>\d+)\])?/);
    if (!match) {
        return ParseErrors.failure("pinDeclaration expected pin");
    }
    const matched = match[0];
    const { pin, w } = match.groups;
    return Ok([
        toPin.substring(matched.length),
        {
            pin,
            width: w ? Number(w) : 1,
        },
    ]);
}
function pin(toPin) {
    const match = toPin
        .toString()
        .match(/^(?<pin>[0-9a-z]+|[Tt]rue|[Ff]alse)(\[(?<i>\d+)(\.\.(?<j>\d+))?\])?/);
    if (!match) {
        return ParseErrors.failure("toPin expected pin");
    }
    const matched = match[0];
    const { pin, i, j } = match.groups;
    const start = i ? Number(i) : undefined;
    const end = j ? Number(j) : start !== undefined ? start : undefined;
    return Ok([
        toPin.substring(matched.length),
        {
            pin,
            start,
            end,
        },
    ]);
}
const wireParser = separated(hdlWs(pin), token("="), hdlWs(pin));
const wire = (i) => wireParser(i);
const wireListParser = list(wire, tag(","));
const wireList = (i) => wireListParser(i);
const partParser = tuple(hdlIdentifier, delimited(token("("), wireList, token(")")));
const part = (i) => {
    const parse = partParser(i);
    if (isErr(parse)) {
        return ParseErrors.error("part parser has no identifier");
    }
    const [input, [name, wires]] = Ok(parse);
    const part = {
        name: name.toString(),
        wires: wires.map(([lhs, rhs]) => ({ lhs, rhs })),
    };
    return Ok([input, part]);
};
const pinDeclParser = list(hdlWs(pinDeclaration), token(","));
const pinList = (i) => pinDeclParser(i);
const inDeclParser = delimited(token("IN"), pinList, token(";"));
const inList = (i) => inDeclParser(i);
const outDeclParser = delimited(token("OUT"), pinList, token(";"));
const outList = (i) => outDeclParser(i);
const partsParser = alt(preceded(token("PARTS:"), many0(terminated(part, token(";")))), value("BUILTIN", terminated(token("BUILTIN"), token(";"))));
const parts = (i) => partsParser(i);
const chipBlockParser = delimited(token("{"), tuple(inList, outList, parts), token("}"));
const chipBlock = (i) => chipBlockParser(i);
const chipParser = preceded(hdlWs(tag("CHIP")), pair(hdlIdentifier, chipBlock));
function HdlParser(i) {
    const chipParse = chipParser(i);
    if (isErr(chipParse)) {
        return chipParse;
    }
    const [_, [name, [ins, outs, parts]]] = Ok(chipParse);
    return Ok(["", { name: name.toString(), ins, outs, parts }]);
}
const TEST_ONLY$1 = {
    hdlWs,
    hdlIdentifier,
    pin,
    inList,
    outList,
    part,
    parts,
    chipBlock,
    chipParser,
    wire,
};

function add16(a, b) {
    return [(a + b) & 0xffff];
}
class Add16 extends Chip$1 {
    constructor() {
        super(["a[16]", "b[16]"], ["out[16]"], "Add16");
    }
    eval() {
        const a = this.in("a").busVoltage;
        const b = this.in("b").busVoltage;
        const [out] = add16(a, b);
        this.out().busVoltage = out;
    }
}

const COMMANDS = {
    asm: {
        0: 0b101010,
        1: 0b111111,
        "-1": 0b111010,
        D: 0b001100,
        A: 0b110000,
        "!D": 0b001101,
        "!A": 0b110001,
        "-D": 0b001111,
        "-A": 0b110011,
        "D+1": 0b011111,
        "A+1": 0b110111,
        "D-1": 0b001110,
        "A-1": 0b110010,
        "D+A": 0b000010,
        "D-A": 0b010011,
        "A-D": 0b000111,
        "D&A": 0b000000,
        "D|A": 0b010101, // 21 0x15
    },
    op: {
        0x2a: "0",
        0x3f: "1",
        0x3a: "-1",
        0x0c: "D",
        0x30: "A",
        0x0d: "!D",
        0x31: "!A",
        0x0f: "-D",
        0x33: "-A",
        0x1f: "D+1",
        0x37: "A+1",
        0x0e: "D-1",
        0x32: "A-1",
        0x02: "D+A",
        0x13: "D-A",
        0x07: "A-D",
        0x00: "D&A",
        0x15: "D|A",
    },
};
const ASSIGN = {
    asm: {
        "": 0x0,
        M: 0b001,
        D: 0b010,
        MD: 0b011,
        A: 0b100,
        AM: 0b101,
        AD: 0b110,
        AMD: 0b111,
    },
    op: {
        0x0: "",
        0x1: "M",
        0x2: "D",
        0x3: "MD",
        0x4: "A",
        0x5: "AM",
        0x6: "AD",
        0x7: "AMD",
    },
};
const JUMP = {
    asm: {
        "": 0b0,
        JGT: 0b001,
        JEQ: 0b010,
        JGE: 0b011,
        JLT: 0b100,
        JNE: 0b101,
        JLE: 0b110,
        JMP: 0b111,
    },
    op: {
        0x0: "",
        0x1: "JGT",
        0x2: "JEQ",
        0x3: "JGE",
        0x4: "JLT",
        0x5: "JNE",
        0x6: "JLE",
        0x7: "JMP",
    },
};
const Flags = {
    0x00: "Positive",
    0x01: "Zero",
    0x02: "Negative",
    Positive: 0x00,
    Zero: 0x01,
    Negative: 0x02,
};
function alu(op, d, a) {
    let o = 0;
    switch (op) {
        case 0x2a:
            o = 0;
            break;
        case 0x3f:
            o = 1;
            break;
        case 0x3a:
            o = -1;
            break;
        case 0x0c:
            o = d;
            break;
        case 0x30:
            o = a;
            break;
        case 0x0d:
            o = ~d;
            break;
        case 0x31:
            o = ~a;
            break;
        case 0x0f:
            o = -d;
            break;
        case 0x33:
            o = -a;
            break;
        case 0x1f:
            o = d + 1;
            break;
        case 0x37:
            o = a + 1;
            break;
        case 0x0e:
            o = d - 1;
            break;
        case 0x32:
            o = a - 1;
            break;
        case 0x02:
            o = d + a;
            break;
        case 0x13:
            o = d - a;
            break;
        case 0x07:
            o = a - d;
            break;
        case 0x00:
            o = d & a;
            break;
        case 0x15:
            o = d | a;
            break;
    }
    o = o & 0xffff;
    const flags = o === 0 ? Flags.Zero : o & 0x8000 ? Flags.Negative : Flags.Positive;
    return [o, flags];
}

class ALUNoStat extends Chip$1 {
    constructor() {
        super([
            "x[16]",
            "y[16]",
            "zx",
            "nx",
            "zy",
            "ny",
            "f",
            "no", // negate the out output?
        ], [
            "out[16]", // 16-bit output
        ], "ALU");
    }
    eval() {
        const x = this.in("x").busVoltage;
        const y = this.in("y").busVoltage;
        const zx = this.in("zx").busVoltage << 5;
        const nx = this.in("nx").busVoltage << 4;
        const zy = this.in("zy").busVoltage << 3;
        const ny = this.in("ny").busVoltage << 2;
        const f = this.in("f").busVoltage << 1;
        const no = this.in("no").busVoltage << 0;
        const op = zx + nx + zy + ny + f + no;
        const [out] = alu(op, x, y);
        this.out().busVoltage = out;
    }
}
class ALU extends Chip$1 {
    constructor() {
        super([
            "x[16]",
            "y[16]",
            "zx",
            "nx",
            "zy",
            "ny",
            "f",
            "no", // negate the out output?
        ], [
            "out[16]",
            "zr",
            "ng", // 1 if (out < 0),  0 otherwise
        ], "ALU");
    }
    eval() {
        const x = this.in("x").busVoltage;
        const y = this.in("y").busVoltage;
        const zx = this.in("zx").busVoltage << 5;
        const nx = this.in("nx").busVoltage << 4;
        const zy = this.in("zy").busVoltage << 3;
        const ny = this.in("ny").busVoltage << 2;
        const f = this.in("f").busVoltage << 1;
        const no = this.in("no").busVoltage << 0;
        const op = zx + nx + zy + ny + f + no;
        const [out, flags] = alu(op, x, y);
        const ng = flags == Flags.Negative ? HIGH : LOW;
        const zr = flags == Flags.Zero ? HIGH : LOW;
        this.out("out").busVoltage = out;
        this.out("ng").pull(ng);
        this.out("zr").pull(zr);
    }
}

function or(a, b) {
    return [a == 1 || b == 1 ? HIGH : LOW];
}
function or16(a, b) {
    return [(a | b) & 0xffff];
}
function or8way(a) {
    return [(a & 0xff) == 0 ? LOW : HIGH];
}
class Or extends Chip$1 {
    constructor() {
        super(["a", "b"], ["out"]);
    }
    eval() {
        const a = this.in("a").voltage();
        const b = this.in("b").voltage();
        const [out] = or(a, b);
        this.out().pull(out);
    }
}
class Or16 extends Chip$1 {
    constructor() {
        super(["a[16]", "b[16]"], ["out[16"]);
    }
    eval() {
        const a = this.in("a").busVoltage;
        const b = this.in("b").busVoltage;
        const [out] = or16(a, b);
        this.out().busVoltage = out;
    }
}
class Or8way extends Chip$1 {
    constructor() {
        super(["in[8]"], ["out"], "Or8way");
    }
    eval() {
        const inn = this.in().busVoltage;
        const [out] = or8way(inn);
        this.out().pull(out);
    }
}

function halfAdder(a, b) {
    const sum = (a === 1 && b === 0) || (a === 0 && b === 1) ? HIGH : LOW;
    const car = a === 1 && b === 1 ? HIGH : LOW;
    return [sum, car];
}
class HalfAdder extends Chip$1 {
    constructor() {
        super(["a", "b"], ["sum", "carry"]);
    }
    eval() {
        const a = this.in("a").voltage();
        const b = this.in("b").voltage();
        const [sum, carry] = halfAdder(a, b);
        this.out("sum").pull(sum);
        this.out("carry").pull(carry);
    }
}

function fullAdder(a, b, c) {
    const [s, ca] = halfAdder(a, b);
    const [sum, cb] = halfAdder(s, c);
    const [carry] = or(ca, cb);
    return [sum, carry];
}
class FullAdder extends Chip$1 {
    constructor() {
        super(["a", "b", "c"], ["sum", "carry"]);
    }
    eval() {
        const a = this.in("a").voltage();
        const b = this.in("b").voltage();
        const c = this.in("c").voltage();
        const [sum, carry] = fullAdder(a, b, c);
        this.out("sum").pull(sum);
        this.out("carry").pull(carry);
    }
}

function inc16(n) {
    return add16(n, 1);
}
class Inc16 extends Chip$1 {
    constructor() {
        super(["in[16]"], ["out[16]"], "Inc16");
    }
    eval() {
        const a = this.in().busVoltage;
        const [out] = inc16(a);
        this.out().busVoltage = out;
    }
}

function and(a, b) {
    return [a == 1 && b == 1 ? HIGH : LOW];
}
function and16(a, b) {
    return [a & b & 0xffff];
}
class And extends Chip$1 {
    constructor() {
        super(["a", "b"], ["out"]);
    }
    eval() {
        const a = this.in("a").voltage();
        const b = this.in("b").voltage();
        const [n] = and(a, b);
        this.out().pull(n);
    }
}
class And16 extends Chip$1 {
    constructor() {
        super(["a[16]", "b[16]"], ["out[16]"]);
    }
    eval() {
        const a = this.in("a").busVoltage;
        const b = this.in("b").busVoltage;
        const [n] = and16(a, b);
        this.out().busVoltage = n;
    }
}

function demux(inn, sel) {
    const a = sel == LOW && inn == HIGH ? HIGH : LOW;
    const b = sel == HIGH && inn == HIGH ? HIGH : LOW;
    return [a, b];
}
class Demux extends Chip$1 {
    constructor() {
        super(["in", "sel"], ["a", "b"]);
    }
    eval() {
        const inn = this.in("in").voltage();
        const sel = this.in("sel").voltage();
        const [a, b] = demux(inn, sel);
        this.out("a").pull(a);
        this.out("b").pull(b);
    }
}

function mux(a, b, sel) {
    return [sel === 0 ? a : b];
}
function mux16(a, b, sel) {
    return [sel === 0 ? a : b];
}
class Mux extends Chip$1 {
    constructor() {
        super(["a", "b", "sel"], ["out"]);
    }
    eval() {
        const a = this.in("a").voltage();
        const b = this.in("b").voltage();
        const sel = this.in("sel").voltage();
        const set = mux(a, b, sel);
        if (set) {
            this.out().pull(HIGH);
        }
        else {
            this.out().pull(LOW);
        }
    }
}
class Mux16 extends Chip$1 {
    constructor() {
        super(["a[16]", "b[16]", "sel"], ["out[16]"]);
    }
    eval() {
        const a = this.in("a").busVoltage;
        const b = this.in("b").busVoltage;
        const sel = this.in("sel").voltage();
        const [out] = mux16(a, b, sel);
        this.out().busVoltage = out;
    }
}

function nand(a, b) {
    return [a == 1 && b == 1 ? LOW : HIGH];
}
class Nand extends Chip$1 {
    constructor() {
        super(["a", "b"], ["out"]);
    }
    eval() {
        const a = this.in("a").voltage();
        const b = this.in("b").voltage();
        const [out] = nand(a, b);
        this.out().pull(out);
    }
}
class Nand16 extends Chip$1 {
    constructor() {
        super(["a[16]", "b[16]"], ["out[16]"]);
    }
    eval() {
        const a = this.in("a").busVoltage;
        const b = this.in("b").busVoltage;
        this.out().busVoltage = nand16(a, b);
    }
}

function not(inn) {
    return [inn === LOW ? HIGH : LOW];
}
function not16(inn) {
    return [~inn & 0xffff];
}
class Not extends Chip$1 {
    constructor() {
        super(["in"], ["out"]);
    }
    eval() {
        const a = this.in("in").voltage();
        const [out] = not(a);
        this.out().pull(out);
    }
}
class Not16 extends Chip$1 {
    constructor() {
        super(["in[16]"], ["out[16]"]);
    }
    eval() {
        const [n] = not16(this.in().busVoltage);
        this.out().busVoltage = n;
    }
}

function xor(a, b) {
    return [(a == HIGH && b == LOW) || (a == LOW && b == HIGH) ? HIGH : LOW];
}
function xor16(a, b) {
    return [(a ^ b) & 0xffff];
}
class Xor extends Chip$1 {
    constructor() {
        super(["a", "b"], ["out"]);
    }
    eval() {
        const a = this.in("a").voltage();
        const b = this.in("b").voltage();
        const [out] = xor(a, b);
        this.out().pull(out);
    }
}
class Xor16 extends Chip$1 {
    constructor() {
        super(["a[16]", "b[16]"], ["out[16]"]);
    }
    eval() {
        const a = this.in("a").busVoltage;
        const b = this.in("b").busVoltage;
        const [out] = xor16(a, b);
        this.out().busVoltage = out;
    }
}

const REGISTRY = new Map([
    ["Nand", Nand],
    ["Nand16", Nand16],
    ["Not", Not],
    ["Not16", Not16],
    ["And", And],
    ["And16", And16],
    ["Or", Or],
    ["Or16", Or16],
    ["Or8way", Or8way],
    ["XOr", Xor],
    ["XOr16", Xor16],
    ["Xor", Xor],
    ["Xor16", Xor16],
    ["Mux", Mux],
    ["Mux16", Mux16],
    ["Demux", Demux],
    ["HalfAdder", HalfAdder],
    ["FullAdder", FullAdder],
    ["Add16", Add16],
    ["Inc16", Inc16],
    ["ALU", ALU],
    ["ALUNoStat", ALUNoStat],
].map(([name, ChipCtor]) => [
    name,
    () => {
        const chip = new ChipCtor();
        chip.name = name;
        return chip;
    },
]));
function getBuiltinChip(name) {
    const chip = REGISTRY.get(name);
    return chip
        ? Ok(chip())
        : Err(new Error(`Chip ${name} not in builtin registry`));
}

function pinWidth(start, end) {
    if (end === undefined) {
        return undefined;
    }
    if (end >= start) {
        return end - start + 1;
    }
    if (start > 0 && end == 0) {
        return 1;
    }
    throw new Error(`Bus specification has start > end (${start} > ${end})`);
}
function parse(code) {
    const parsed = HdlParser(code);
    if (isErr(parsed))
        return parsed;
    const [_, parts] = Ok(parsed);
    if (parts.parts === "BUILTIN") {
        return getBuiltinChip(parts.name);
    }
    const buildChip = new Chip$1(parts.ins, parts.outs, parts.name);
    for (const part of parts.parts) {
        const builtin = getBuiltinChip(part.name);
        if (isErr(builtin))
            return builtin;
        const partChip = Ok(builtin);
        const wires = part.wires.map(({ lhs, rhs }) => ({
            to: {
                name: lhs.pin,
                start: lhs.start ?? 0,
                width: pinWidth(lhs.start ?? 0, lhs.end),
            },
            from: {
                name: rhs.pin,
                start: rhs.start ?? 0,
                width: pinWidth(rhs.start ?? 0, rhs.end),
            },
        }));
        buildChip.wire(partChip, wires);
    }
    return Ok(buildChip);
}

/** Reads tst files to apply and perform test runs. */
const tstNumberValue = (p, r) => map(p, (i) => int(i.toString(), r));
const tstBinaryValueParser = preceded(tag("B"), tag(/[01]{1,16}/));
const tstHexValueParser = preceded(tag("X"), tag(/[0-9a-fA-F]{1,4}/));
const tstDecimalValueParser = preceded(opt(tag("D")), tag(/(-[1-9])?[0-9]{0,4}/));
const tstHexValue = tstNumberValue(tstHexValueParser, 16);
const tstDecimalValue = tstNumberValue(tstDecimalValueParser, 10);
const tstBinaryValue = tstNumberValue(tstBinaryValueParser, 2);
const tstValueParser = alt(preceded(tag("%"), alt(tstBinaryValue, tstHexValue, tstDecimalValue)), tstDecimalValue);
const tstValue = (i) => tstValueParser(i);
const setParser = map(preceded(token("set"), pair(token(identifier()), token(tstValue))), ([id, value]) => ({ op: "set", id: id.toString(), value }));
const set$1 = (i) => setParser(i);
const tstOp = alt(set$1, valueFn(() => ({ op: "eval" }), token("eval")), valueFn(() => ({ op: "output" }), token("output")));
const tstOpLineParser = map(terminated(list(tstOp, token(",")), token(";")), (ops) => ({ ops }));
const tstOutputFormatParser = tuple(identifier(), opt(preceded(tag("%"), alt(tag("X"), tag("B"), tag("D")))), tag(/\d+\.\d+\.\d+/));
const tstOutputFormat = map(tstOutputFormatParser, ([id, style, tag]) => {
    const [a, b, c] = tag.toString().split(".");
    return {
        id: id.toString(),
        // @ts-ignore
        style: unwrapOr(style, "D"),
        width: int10(b),
        lpad: int10(a),
        rpad: int10(c),
    };
});
const tstOutputListParser = map(preceded(token("output-list"), list(token(tstOutputFormat), filler())), (spec) => ({ op: "output-list", spec }));
const tstConfigParser = alt(tstOutputListParser);
const tstConfigLineParser = map(terminated(list(tstConfigParser, token(",")), token(";")), (ops) => ({ ops }));
const tstParser = map(terminated(many1(alt(tstConfigLineParser, tstOpLineParser)), filler()), (lines) => ({ lines }));
const TEST_ONLY = {
    set: set$1,
    tstValue,
    tstOp,
    tstOutputFormat,
    tstOutputListParser,
    tstConfigParser,
};

/** Reads and parses a .cmp file, to compare lines of output between test runs. */
const cmpParser = many0(mapParser(line(), terminated(many1(preceded(tag("|"), map(take_until(tag("|")), (s) => s.toString()))), tag("|"))));

class Output {
    variable;
    format;
    fmt;
    lPad;
    rPad;
    len;
    // new Output(inst.id, inst.style, inst.width, inst.lpad, inst.rpad)
    constructor(variable, format = "%B1.1.1", len, lPad, rPad) {
        this.variable = variable;
        this.format = format;
        if (format.startsWith("%") &&
            len == undefined &&
            lPad == undefined &&
            rPad == undefined) {
            const { fmt, lPad, rPad, len } = format.match(/^%(?<fmt>[BDXS])(?<lPad>\d+)\.(?<len>\d+)\.(?<rPad>\d+)$/)?.groups;
            this.fmt = fmt;
            this.lPad = parseInt(lPad);
            this.rPad = parseInt(rPad);
            this.len = parseInt(len);
        }
        else {
            assert(["B", "X", "D", "S"].includes(format[0]));
            this.fmt = format[0];
            this.len = len ?? 3;
            this.lPad = lPad ?? 1;
            this.rPad = rPad ?? 1;
        }
    }
    header(test) {
        return this.pad(this.variable);
    }
    print(test) {
        const val = test.getVar(this.variable);
        const fmt = { B: bin, D: dec, X: hex, S: (i) => `${i}` }[this.fmt];
        let value = fmt(val);
        return this.pad(value.slice(value.length - this.len));
    }
    pad(value) {
        const space = this.lPad + this.len + this.rPad;
        const leftSpace = Math.floor((space - value.length) / 2);
        const rightSpace = space - leftSpace - value.length;
        const padLeft = leftSpace + value.length;
        const padRight = padLeft + rightSpace;
        value = value.padStart(padLeft);
        value = value.padEnd(padRight);
        return value;
    }
}

class Test$1 {
    instructions = [];
    _outputList = [];
    _log = "";
    load(filename) { }
    compareTo(filename) { }
    outputFile(filename) { }
    outputList(outputs) {
        this._outputList = outputs;
    }
    addInstruction(instruction) {
        this.instructions.push(instruction);
    }
    run() {
        for (const instruction of this.instructions) {
            instruction.do(this);
        }
    }
    echo(content) { }
    clearEcho() { }
    breakpoints = new Map();
    addBreakpoint(variable, value) {
        this.breakpoints.set(variable, value);
    }
    clearBreakpoints() {
        this.breakpoints.clear();
    }
    output() {
        const values = this._outputList.map((output) => output.print(this));
        this._log += `|${values.join("|")}|\n`;
    }
    header() {
        const values = this._outputList.map((output) => output.header(this));
        this._log += `|${values.join("|")}|\n`;
    }
    log() {
        return this._log;
    }
}
class ChipTest extends Test$1 {
    chip = new Nand();
    static from(tst) {
        const test = new ChipTest();
        for (const line of tst.lines) {
            for (const inst of line.ops) {
                switch (inst.op) {
                    case "eval":
                        test.addInstruction(new TestEvalInstruction());
                        break;
                    case "output":
                        test.addInstruction(new TestOutputInstruction());
                        break;
                    case "set":
                        test.addInstruction(new TestSetInstruction(inst.id, inst.value));
                        break;
                    case "output-list":
                        test.addInstruction(new TestOutputListInstruction(inst.spec));
                }
            }
        }
        return test;
    }
    with(chip) {
        this.chip = chip;
        return this;
    }
    hasVar(variable) {
        variable = `${variable}`;
        return (this.chip.in(variable) !== undefined ||
            this.chip.out(variable) !== undefined);
    }
    getVar(variable) {
        variable = `${variable}`;
        const pin = this.chip.get(variable);
        if (!pin)
            return 0;
        return pin instanceof Bus ? pin.busVoltage : pin.voltage();
    }
    setVar(variable, value) {
        const pinOrBus = this.chip.in(`${variable}`);
        if (pinOrBus instanceof Bus) {
            pinOrBus.busVoltage = value;
        }
        else {
            pinOrBus.pull(value == 0 ? LOW : HIGH);
        }
    }
    eval() {
        this.chip.eval();
    }
    tick() {
        this.chip.tick();
    }
    tock() {
        this.chip.tock();
    }
}
class TestSetInstruction {
    variable;
    value;
    constructor(variable, value) {
        this.variable = variable;
        this.value = value;
    }
    do(test) {
        test.setVar(this.variable, this.value);
    }
}
class TestOutputInstruction {
    do(test) {
        test.output();
    }
}
class TestOutputListInstruction {
    outputs = [];
    constructor(specs = []) {
        for (const spec of specs) {
            this.addOutput(spec);
        }
    }
    addOutput(inst) {
        this.outputs.push(new Output(inst.id, inst.style, inst.width, inst.lpad, inst.rpad));
    }
    do(test) {
        test.outputList(this.outputs);
        test.header();
    }
}
class TestEvalInstruction {
    _chipTestInstruction_ = true;
    do(test) {
        test.eval();
    }
}

function compare(as, bs) {
    let diffs = [];
    const q = Math.max(as.length, bs.length);
    for (let row = 0; row < q; row++) {
        const a = as[row] ?? [];
        const b = bs[row] ?? [];
        diffs = diffs.concat(diff(a, b).map((diff) => {
            diff.row = row;
            return diff;
        }));
    }
    return diffs;
}
function diff(as, bs) {
    const diffs = [];
    const q = Math.max(as.length, bs.length);
    for (let col = 0; col < q; col++) {
        const a = as[col] ?? "";
        const b = bs[col] ?? "";
        if (a !== b) {
            diffs.push({ a, b, col });
        }
    }
    return diffs;
}

const DiffPanel = FC("diff-panel", (el, { diffs = [] }) => {
    return [
        span(`Failed ${diffs.length} assertions`),
        ol(...diffs.map(({ a, b, row, col }) => li("Expected ", del(a), "Actual", ins(b), span(`at ${row}:${col}`)))),
    ];
});

const PROJECTS = {
    "01": [
        "Not",
        "And",
        "Or",
        "XOr",
        "Mux",
        "DMux",
        "Not16",
        "And16",
        "Or16",
        "Mux16",
        "Mux4way16",
        "Mux8way16",
        "DMux4way",
        "DMux8way",
        "Or8way",
    ],
    "02": ["HalfAdder", "FullAdder", "Add16", "Inc16", "AluNoStat", "ALU"],
    "03": ["Bit", "Register", "PC", "RAM8", "RAM64", "RAM512", "RAM4k", "RAM16k"],
};
function makeProjectDropdown(selected, setProject) {
    return Dropdown({
        style: {
            display: "inline-block",
        },
        selected,
        events: {
            change: (event) => setProject(event.target?.value),
        },
    }, {
        "01": "Logic",
        "02": "Arithmetic",
        "03": "Memory",
        "04": "Assembly",
        "05": "Architecture",
    });
}
function makeChipsDropdown(selected, chips, setChip) {
    return Dropdown({
        style: {
            display: "inline-block",
        },
        selected,
        events: {
            change: (event) => setChip(event.target?.value),
        },
    }, chips);
}
const Chip = () => {
    const fs = unwrap(retrieve("fs"));
    const statusLine = unwrap(retrieve("status"));
    let project = localStorage["chip/project"] ?? "01";
    let chips = PROJECTS[project];
    let chipName = localStorage["chip/chip"] ?? "And";
    let maybeChip = getBuiltinChip(chipName);
    if (isErr(maybeChip))
        statusLine(display(Err(maybeChip)));
    let chip = isErr(maybeChip) ? new Low() : Ok(maybeChip);
    setTimeout(async function () {
        await setProject(project);
        await setChip(chip.name);
    });
    const onToggle = (pin) => {
        if (pin.width == 1) {
            pin.toggle();
        }
        else {
            pin.busVoltage += 1;
        }
        chip.eval();
        setState();
    };
    const chipsDropdown = span();
    const projectDropdown = span();
    const inPinout = Pinout({ pins: chip.ins, toggle: onToggle });
    const outPinout = Pinout({ pins: chip.outs });
    const pinsPinout = Pinout({ pins: chip.pins });
    const hdlTextarea = textarea({ class: "font-monospace flex-1", rows: 10 });
    const tstTextarea = textarea({ class: "font-monospace flex-2", rows: 15 });
    const cmpTextarea = textarea({ class: "font-monospace flex-1", rows: 5 });
    const outTextarea = textarea({
        class: "font-monospace flex-1",
        rows: 5,
        readOnly: true,
    });
    const diffPanel = DiffPanel();
    const runner = new (class ChipRunner extends Timer {
        tick() {
            chip.eval();
            // tickScreen();
        }
        finishFrame() {
            setState();
        }
        reset() {
            for (const pin of chip.ins.entries()) {
                pin.pull(LOW);
            }
            chip.eval();
            setState();
        }
        toggle() {
            runbar.update();
        }
    })();
    const runbar = Runbar({ runner });
    function setState() {
        inPinout.update({ pins: chip.ins });
        outPinout.update({ pins: chip.outs });
        pinsPinout.update({ pins: chip.pins });
        outTextarea.update("");
        diffPanel.update();
    }
    async function setChip(name) {
        localStorage["chip/chip"] = name;
        const hdl = await fs.readFile(`/projects/${project}/${name}/${name}.hdl`);
        const tst = await fs.readFile(`/projects/${project}/${name}/${name}.tst`);
        const cmp = await fs.readFile(`/projects/${project}/${name}/${name}.cmp`);
        hdlTextarea.value = hdl;
        tstTextarea.value = tst;
        cmpTextarea.value = cmp;
        compileChip(hdl);
    }
    function compileChip(text) {
        const maybeChip = parse(text);
        if (isErr(maybeChip)) {
            statusLine(display(Err(maybeChip)));
            return;
        }
        chip = Ok(maybeChip);
        statusLine(`Compiled ${chip.name}`);
        chip.eval();
        setState();
    }
    async function saveChip(project, name, text) {
        const path = `/projects/${project}/${name}/${name}.hdl`;
        await fs.writeFile(path, text);
        statusLine(`Saved ${path}`);
    }
    async function setProject(proj) {
        localStorage["chip/project"] = project = proj;
        projectDropdown.update(makeProjectDropdown(project, setProject));
        chips = PROJECTS[proj];
        chipName = chipName && chips.includes(chipName) ? chipName : chips[0];
        setChip(chipName);
        chipsDropdown.update(makeChipsDropdown(chipName, chips, setChip));
    }
    function runTest() {
        const tst = tstParser(new Span(tstTextarea.value));
        if (isErr(tst)) {
            statusLine(display(Err(tst)));
            return;
        }
        statusLine("Parsed tst");
        const test = ChipTest.from(Ok(tst)[1]).with(chip);
        test.run();
        outTextarea.value = test.log();
        setState();
        const cmp = cmpParser(new Span(cmpTextarea.value));
        const out = cmpParser(new Span(outTextarea.value));
        if (isErr(cmp)) {
            statusLine(`Error parsing cmp file!`);
            return;
        }
        if (isErr(out)) {
            statusLine(`Error parsing out file!`);
            return;
        }
        const diffs = compare(Ok(cmp)[1], Ok(out)[1]);
        diffPanel.update({ diffs });
    }
    const fstyle = {
        ".View__Chip": {
            "> section": {
                grid: "auto / 2fr 1fr",
                "> .pinouts": {
                    grid: "min-content repeat(2, minmax(200px, 1fr)) / 1fr 1fr",
                    h2: { margin: "0 var(--nav-element-spacing-horizontal)" },
                },
            },
        },
        "@media (max-width: 992px)": {
            ".View__Chip > section": {
                display: "flex",
                flexDirection: "column",
            },
        },
        "@media (max-width: 576px)": {
            ".View__Chip > section > .pinouts": {
                display: "flex",
                flexDirection: "column",
                "> h2": { order: "0" },
                "> article:not(nth-of-type(3))": { order: "1" },
                "> article:nth-of-type(3)": { order: "2" },
            },
        },
    };
    return div({ class: "View__Chip flex-1 flex" }, style(compileFStyle(fstyle)), 
    // runbar,
    section({ class: "flex-1 grid" }, div({ class: "pinouts grid" }, div({
        class: "flex row inline align-end",
        style: { gridColumn: "1 / span 2" },
    }, projectDropdown, h2({ tabIndex: 0 }, "Chips:"), chipsDropdown), article({ class: "no-shadow panel" }, header(div({ tabIndex: 0 }, "HDL"), fieldset({ class: "button-group" }, button({
        events: {
            click: () => compileChip(hdlTextarea.value),
            keypress: () => compileChip(hdlTextarea.value),
        },
    }, "Compile"), button({
        events: {
            click: () => saveChip(project, chip.name, hdlTextarea.value),
            keypress: () => saveChip(project, chip.name, hdlTextarea.value),
        },
    }, "Save"))), main({ class: "flex" }, hdlTextarea)), article({ class: "no-shadow panel" }, header({ tabIndex: 0 }, "Input pins"), inPinout), article({ class: "no-shadow panel" }, header({ tabIndex: 0 }, "Internal Pins"), pinsPinout), article({ class: "no-shadow panel" }, header({ tabIndex: 0 }, "Output pins"), outPinout)), article(header(div({ tabIndex: 0 }, "Test"), fieldset({ class: "input-group" }, button({
        events: {
            click: (e) => {
                e.preventDefault();
                runTest();
            },
        },
    }, "Execute"))), tstTextarea, cmpTextarea, outTextarea, diffPanel)));
};

function asm(op) {
    if (op & 0x8000) {
        return cInstruction(op);
    }
    return aInstruction(op);
}
function cInstruction(op) {
    op = op & 0xffff; // Clear high order bits
    const mop = (op & 0x1000) >> 12;
    let cop = ((op & 0b0000111111000000) >> 6);
    let sop = ((op & 0b0000000000111000) >> 3);
    let jop = (op & 0b0000000000000111);
    if (COMMANDS.op[cop] === undefined) {
        // Invalid commend
        return "#ERR";
    }
    let command = COMMANDS.op[cop];
    if (mop) {
        command = command.replace(/A/g, "M");
    }
    const store = ASSIGN.op[sop];
    const jump = JUMP.op[jop];
    let instruction = command;
    if (store) {
        instruction = `${store}=${instruction}`;
    }
    if (jump) {
        instruction = `${instruction};${jump}`;
    }
    return instruction;
}
function aInstruction(op) {
    return "@" + (op & 0x7fff).toString(10);
}
function op(asm) {
    if (asm[0] === "@") {
        return aop(asm);
    }
    else {
        return cop(asm);
    }
}
function aop(asm) {
    return parseInt(asm.substring(1), 10);
}
function cop(asm) {
    let parts = asm.match(/(?:([AMD]{1,3})=)?([-!01ADM&|]{1,3})(?:;(JGT|JLT|JGE|JLE|JEQ|JMP))?/);
    if (!parts) {
        parts = ["", "", ""];
    }
    else if (parts.length === 2) {
        parts = ["", parts[1], ""];
    }
    else if (parts.length === 3) {
        if (parts[2][0] === ";") {
            parts = ["", parts[1], parts[2]];
        }
        else {
            parts = [parts[1], parts[2], ""];
        }
    }
    const [_, assign, operation, jump] = parts;
    const mode = operation.indexOf("M") > 0 ? 1 : 0;
    const aop = ASSIGN.asm[assign] ?? 0;
    const jop = JUMP.asm[jump] ?? 0;
    const cop = COMMANDS.asm[operation] ?? 0;
    return 0xd000 | (mode << 12) | (cop << 6) | (aop << 3) | jop;
}

const FORMATS = ["bin", "dec", "hex", "asm"];
const SCREEN = 0x4000;
class Memory$1 {
    #memory;
    get size() {
        return this.#memory.length;
    }
    constructor(memory) {
        if (typeof memory === "number") {
            this.#memory = new Int16Array(memory);
        }
        else {
            this.#memory = new Int16Array(memory);
        }
    }
    get(index) {
        if (index < 0 || index >= this.size) {
            return 0xffff;
        }
        return this.#memory[index] ?? 0;
    }
    set(index, value) {
        if (index >= 0 && index < this.size) {
            this.#memory[index] = value & 0xffff;
        }
    }
    update(cell, value, format) {
        let current;
        switch (format) {
            case "asm":
                current = op(value);
                break;
            case "bin":
                current = int2(value);
                break;
            case "hex":
                current = int16(value);
                break;
            case "dec":
            default:
                current = int10(value);
                break;
        }
        if (isFinite(current) && current <= 0xffff) {
            this.set(cell, current);
        }
    }
    *map(fn, start = 0, end = this.size) {
        assert(start < end);
        for (let i = start; i < end; i++) {
            yield fn(i, this.get(i));
        }
    }
}

class CPU$1 {
    RAM;
    ROM;
    #pc = 0;
    #a = 0;
    #d = 0;
    get PC() {
        return this.#pc;
    }
    get A() {
        return this.#a;
    }
    get D() {
        return this.#d;
    }
    constructor({ RAM = new Memory$1(0x7fff), ROM, }) {
        this.RAM = RAM;
        this.ROM = ROM;
    }
    reset() {
        this.#pc = 0;
        this.#a = 0;
        this.#d = 0;
    }
    tick() {
        let instruction = this.ROM.get(this.#pc);
        let pc = this.#pc + 1;
        if (instruction & 0x8000) {
            // Calculate ALU result
            const mode = (instruction & 0x1000) > 0;
            const op = (instruction & 0x0fc0) >> 6;
            const a = mode ? this.RAM.get(this.#a) : this.#a;
            const [d, flag] = alu(op, this.#d, a);
            // Store M uses old A, this must come first
            if ((instruction & 0x0008) > 0) {
                this.RAM.set(this.#a, d);
            }
            if ((instruction & 0x0020) > 0) {
                this.#a = d;
            }
            if ((instruction & 0x0010) > 0) {
                this.#d = d;
            }
            // Check jump
            const jn = (instruction & 0x0004) > 0 && flag === Flags.Negative;
            const je = (instruction & 0x0002) > 0 && flag === Flags.Zero;
            const jg = (instruction & 0x0001) > 0 && flag === Flags.Positive;
            if (jn || je || jg) {
                pc = this.#a;
            }
        }
        else {
            this.#a = instruction;
        }
        if (pc < 0 || pc >= this.ROM.size) {
            throw new Error(`HALT: Jump to ${this.#a} out of bounds [0, ${this.ROM.size})`);
        }
        this.#pc = pc;
    }
}

let buttonBarId = 1;
let nextId = () => buttonBarId++;
const ButtonBar = FC("button-bar", (el, { value, values, events }) => {
    const name = `button-bar-${nextId()}`;
    return fieldset({ class: "input-group" }, ...values
        .map((option) => {
        const opt = `${option}`.replace(/\s+/g, "_").toLowerCase();
        const id = `${name}-${opt}`;
        return [
            label({ role: "button", htmlFor: id }, input({
                type: "radio",
                id,
                name,
                value: option,
                checked: option === value,
                events: {
                    change: () => events.onSelect(option),
                },
            }), display(option)),
        ];
    })
        .flat());
});

const Sizes = {
    none: "0px",
    sm: "0.125rem",
    "": "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
    "3xl": "1.5rem",
    full: "9999px",
};
const Sides = {
    "": "",
    t: "Top",
    r: "Right",
    l: "Left",
    b: "Bottom",
    tl: "TopLeft",
    tr: "TopRight",
    bl: "BottomLeft",
    br: "BottomRight",
};
const Widths = {
    "1/4": "25%",
    "1/2": "50%",
    "3/4": "75%",
    full: "100%",
};

function width(amount, block) {
    if (amount === undefined && Widths[block] !== undefined) {
        amount = block;
    }
    return {
        ...(block === "inline" ? { display: "inline-block" } : {}),
        width: Widths[amount] ?? "0",
    };
}

const Mode = { VIEW: 0, EDIT: 1 };
const InlineEdit = FC("inline-edit", (el, { mode = Mode.VIEW, value, events }) => {
    const state = (el[State] ??= { mode, value });
    const render = () => {
        switch (state.mode) {
            case Mode.EDIT:
                return edit();
            case Mode.VIEW:
                return view();
            default:
                return span();
        }
    };
    const view = () => span({
        style: { cursor: "text", ...width("full", "inline") },
        events: {
            click: () => {
                state.mode = Mode.EDIT;
                el.update(render());
            },
        },
    }, state.value ?? "");
    const edit = () => {
        const edit = span({ style: { display: "block", position: "relative" } }, input({
            style: {
                zIndex: "10",
                position: "absolute",
                left: "0",
                marginTop: "-0.375rem",
            },
            events: {
                blur: ({ target }) => events.change(target?.value ?? ""),
            },
            type: "text",
            value: state.value,
        }), "\u00a0" // Hack to get the span to take up space
        );
        setTimeout(() => {
            edit.dispatchEvent(new Event("focus"));
        });
        return edit;
    };
    return render();
});

function debounce(fn, ms = 32) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => (clearTimeout(timer), fn(...args)), ms);
    };
}

function fillVirtualScrollSettings(settings) {
    const { minIndex = 0, maxIndex = 1, startIndex = 0, itemHeight = 20, count = maxIndex - minIndex + 1, tolerance = count, } = settings;
    return { minIndex, maxIndex, startIndex, itemHeight, count, tolerance };
}
function initialState(settings) {
    // From Denis Hilt, https://blog.logrocket.com/virtual-scrolling-core-principles-and-basic-implementation-in-react/
    const { minIndex, maxIndex, startIndex, itemHeight, count, tolerance } = settings;
    const bufferedItems = count + 2 * tolerance;
    const itemsAbove = Math.max(0, startIndex - tolerance - minIndex);
    const viewportHeight = count * itemHeight;
    const totalHeight = (maxIndex - minIndex + 1) * itemHeight;
    const toleranceHeight = tolerance * itemHeight;
    const bufferHeight = viewportHeight + 2 * toleranceHeight;
    const topPaddingHeight = itemsAbove * itemHeight;
    const bottomPaddingHeight = totalHeight - (topPaddingHeight + bufferHeight);
    return {
        scrollTop: 0,
        settings,
        viewportHeight,
        totalHeight,
        toleranceHeight,
        bufferedItems,
        topPaddingHeight,
        bottomPaddingHeight,
        data: [],
        rows: [],
    };
}
function getData(minIndex, maxIndex, offset, limit, get) {
    const start = Math.max(0, minIndex, offset);
    const end = Math.min(maxIndex, offset + limit - 1);
    const data = get(start, end - start);
    return [...data];
}
function doScroll(scrollTop, state, get) {
    const { totalHeight, toleranceHeight, bufferedItems, settings: { itemHeight, minIndex, maxIndex }, } = state;
    const index = minIndex + Math.floor((scrollTop - toleranceHeight) / itemHeight);
    const data = getData(minIndex, maxIndex, index, bufferedItems, get);
    const topPaddingHeight = Math.max((index - minIndex) * itemHeight, 0);
    const bottomPaddingHeight = Math.max(totalHeight - (topPaddingHeight + data.length * itemHeight), 0);
    return { scrollTop, topPaddingHeight, bottomPaddingHeight, data };
}
// export interface VirtualScroll<T, U extends HTMLElement> {
//   state: VirtualScrollState<T>;
//   rows: UHTMLElement<U>[];
// }
const VirtualScroll = FC("virtual-scroll", (element, props) => {
    const settings = fillVirtualScrollSettings(props.settings);
    const state = (element[State] = {
        ...initialState(settings),
        ...element[State],
    });
    const scrollTo = ({ target } = { target: state }) => {
        const scrollTop = target?.scrollTop ?? state.topPaddingHeight;
        const updatedSate = {
            ...state,
            ...doScroll(scrollTop, state, props.get),
        };
        setState(updatedSate);
    };
    const viewportElement = div({
        style: { height: `${state.viewportHeight}px`, overflowY: "scroll" },
        events: { scroll: debounce(scrollTo, 0) },
    });
    setTimeout(() => {
        viewportElement.scroll({ top: state.scrollTop });
    });
    const setState = (newState) => {
        state.scrollTop = newState.scrollTop;
        state.topPaddingHeight = newState.topPaddingHeight;
        state.bottomPaddingHeight = newState.bottomPaddingHeight;
        state.data = newState.data;
        state.rows = state.data.map(props.row);
        viewportElement.update(div({
            class: "VirtualScroll__topPadding",
            style: { height: `${state.topPaddingHeight}px` },
        }), ...(state.rows ?? []).map((row, i) => div({
            class: `VirtualScroll__item_${i}`,
            style: { height: `${settings.itemHeight}px` },
        }, row)), div({
            class: "VirtualScroll__bottomPadding",
            style: { height: `${state.bottomPaddingHeight}px` },
        }));
    };
    scrollTo();
    return viewportElement;
});

function isSide(v) {
    return Sides[v] !== undefined;
}
function getSize(size) {
    return Sizes[size];
}
function getSide(side) {
    switch (side) {
        case "t":
            return [...getSide("tl"), ...getSide("tr")];
        case "r":
            return [...getSide("tr"), ...getSide("br")];
        case "b":
            return [...getSide("br"), ...getSide("bl")];
        case "l":
            return [...getSide("tl"), ...getSide("bl")];
        default:
            return [Sides[side]];
    }
}

function rounded(size = "", side = "") {
    if (isSide(size)) {
        side = size;
        size = "";
    }
    const sized = getSize(size);
    return getSide(side).reduce((prev, curr) => {
        if (curr === "") {
            prev.borderRadius = sized;
        }
        else {
            // @ts-ignore
            prev[`border${curr}Radius`] = sized;
        }
        return prev;
    }, {});
}

const ITEM_HEIGHT = 33.5;
const MemoryBlock = FC("memory-block", (el, { memory, highlight = -1, editable = false, format, onChange }) => {
    const state = (el[State] ??= {});
    if (state.virtualScroll) {
        state.virtualScroll?.update();
    }
    else {
        state.virtualScroll = VirtualScroll({
            settings: { count: 20, maxIndex: memory.size, itemHeight: ITEM_HEIGHT },
            get: (o, l) => memory.map((i, v) => [i, v], o, o + l),
            row: ([i, v]) => 
            // @ts-ignore TODO(TFC)
            MemoryCell({
                index: i,
                value: v,
                editable: editable,
                highlight: i === highlight,
                onChange: (value) => onChange(i, `${value}`, v),
            }),
        });
    }
    return state.virtualScroll;
});
const MemoryCell = FC("memory-cell", (el, { index, value, highlight = false, editable = false, onChange = () => { } }) => {
    el.style.display = "flex";
    return [
        code({
            style: {
                ...rounded("none"),
                ...(highlight
                    ? { background: "var(--code-kbd-background-color)" }
                    : {}),
            },
        }, hex(index)),
        code({
            style: {
                flex: "1",
                textAlign: "right",
                ...rounded("none"),
                ...(highlight
                    ? { background: "var(--code-kbd-background-color)" }
                    : {}),
            },
        }, editable
            ? InlineEdit({
                value: `${value}`,
                events: {
                    // @ts-ignore TODO(FC Events)
                    change: (newValue) => onChange(index, newValue, value),
                },
            })
            : span(`${value}`)),
    ];
});
const Memory = FC("memory-gui", (el, { name = "Memory", highlight = -1, editable = true, memory, format = "dec" }) => {
    el.style.width = "100%";
    const state = (el[State] ??= {});
    state.format ??= format;
    const setFormat = (f) => {
        state.format = f;
        buttonBar.update({ value: state.format });
        memoryBlock.update();
    };
    const buttonBar = ButtonBar({
        value: state.format,
        values: FORMATS,
        events: { onSelect: setFormat },
    });
    const memoryBlock = MemoryBlock({
        memory,
        highlight,
        editable,
        format: (v) => doFormat(state.format ?? "dec", v),
        onChange: (i, v) => {
            memory.update(i, v, state.format ?? "dec");
            memoryBlock.update();
        },
    });
    return article(header(div(name), buttonBar), memoryBlock);
});
function doFormat(format, v) {
    switch (format) {
        case "bin":
            return bin(v);
        case "hex":
            return hex(v);
        case "asm":
            return asm(v);
        case "dec":
        default:
            return dec(v);
    }
}

const HACK = new Int16Array([
    0x0002,
    0xda88,
    0x0000,
    0xfc10,
    0x000f,
    0xd302,
    0x0001,
    0xfc10,
    0x0002,
    0xf090,
    0xd308,
    0x0000,
    0xfc88,
    0x0002,
    0xda87,
    0x000f,
    0xda87, // 0;JMP
]);

const WHITE = "white";
const BLACK = "black";
function get(mem, x, y) {
    const byte = mem.get(SCREEN + 32 * y + ((x / 16) | 0));
    const bit = byte & (1 << x % 16);
    return bit === 0 ? WHITE : BLACK;
}
function set(data, x, y, value) {
    const pixel = (y * 512 + x) * 4;
    const color = value === WHITE ? 255 : 0;
    data[pixel] = color;
    data[pixel + 1] = color;
    data[pixel + 2] = color;
    data[pixel + 3] = 255;
}
const Screen = FC("hack-screen", (el, { memory }) => {
    const state = (el[State] ??= {});
    const screen = (state.screen ??= canvas({ width: 512, height: 256 }));
    const ctx = (state.ctx ??= screen.getContext("2d") ?? undefined);
    if (ctx) {
        const image = assertExists(ctx.getImageData(0, 0, 512, 256), "Failed to create Context2d");
        for (let col = 0; col < 512; col++) {
            for (let row = 0; row < 256; row++) {
                const color = get(memory, col, row);
                set(image.data, col, row, color);
            }
        }
        ctx.putImageData(image, 0, 0);
    }
    return article({ class: "no-shadow panel" }, header("Display"), figure({
        style: {
            width: "100%",
            maxWidth: "512px",
            boxSizing: "content-box",
            marginInline: "auto",
            borderTop: "2px solid gray",
            borderLeft: "2px solid gray",
            borderBottom: "2px solid lightgray",
            borderRight: "2px solid lightgray",
        },
    }, screen));
});

const colorfn = () => (Math.random() * 0xffff) & 0xffff;
const TickScreen = (cpu) => {
    let row = 0;
    let col = 0;
    let color = colorfn();
    return () => {
        const index = SCREEN + col + row * 32;
        cpu.RAM.set(index, color);
        col += 1;
        if (col >= 32) {
            col = 0;
            row += 1;
            color = colorfn();
            if (row >= 256) {
                row = 0;
            }
        }
    };
};

const CPU = ({ cpu } = { cpu: new CPU$1({ ROM: new Memory$1(HACK) }) }) => {
    const PC = span();
    const A = span();
    const D = span();
    let RAM;
    let ROM;
    let runbar;
    let screen;
    const resetRAM = () => {
        cpu.RAM.set(0, 3);
        cpu.RAM.set(1, 2);
        RAM?.update();
        screen?.update();
    };
    resetRAM();
    const tickScreen = TickScreen(cpu);
    const setState = () => {
        PC.update(`PC: ${cpu.PC}`);
        A.update(`A: ${cpu.A}`);
        D.update(`D: ${cpu.D}`);
        RAM?.update({ highlight: cpu.A });
        ROM?.update({ highlight: cpu.PC });
        screen?.update();
    };
    setState();
    const runner = new (class CPURunner extends Timer {
        tick() {
            cpu.tick();
            tickScreen();
        }
        finishFrame() {
            setState();
        }
        reset() {
            cpu.reset();
            setState();
        }
        toggle() {
            runbar.update();
        }
    })();
    return div((runbar = Runbar({ runner }, label(PC, A, D))), div({ class: "grid" }, div({
        class: "grid",
        style: {
            gridAutoFlow: "column",
            gridTemplateColumns: "repeat(2, 1fr)",
        },
    }, (ROM = Memory({
        name: "ROM",
        memory: cpu.ROM,
        highlight: cpu.PC,
        format: "asm",
        editable: false,
    })), (RAM = Memory({ name: "RAM", memory: cpu.RAM, format: "hex" }))), div((screen = Screen({ memory: cpu.RAM })))));
};

const LEVEL = {
    UNKNOWN: 0,
    SILENT: 0,
    DEBUG: 1,
    VERBOSE: 1,
    INFO: 2,
    WARN: 3,
    ERROR: 4,
};
function getLogger(name) {
    const logger = { level: LEVEL.INFO };
    const logAt = (level, fn) => (message, data) => level >= (logger.level ?? LEVEL.SILENT)
        ? fn(display(message), data)
        : undefined;
    logger.debug = logAt(LEVEL.VERBOSE, console.debug.bind(console));
    logger.info = logAt(LEVEL.INFO, console.info.bind(console));
    logger.warn = logAt(LEVEL.WARN, console.warn.bind(console));
    logger.error = logAt(LEVEL.ERROR, console.error.bind(console));
    return logger;
}
getLogger();

const beforeall = Symbol("beforeAll");
const beforeeach = Symbol("beforeEach");
const afterall = Symbol("afterAll");
const aftereach = Symbol("afterEach");
const logger$1 = getLogger();
const CASES = {};
let cases = [CASES];
let totalCases = 0;
function push(title) {
    const next = (cases[0][title] = {});
    cases.unshift(next);
}
function pop() {
    cases.shift();
}
function rootCases() {
    return CASES;
}
function getTotalCases() {
    return totalCases;
}
function describe(title, block) {
    logger$1.debug(`describe(${title})`);
    push(title);
    block();
    pop();
}
function it(title, block) {
    logger$1.debug(`it(${title})`);
    totalCases += 1;
    cases[0][title] = block;
}
it.skip = (title, _block) => {
    logger$1.debug(`it.skip(${title})`);
    totalCases += 1;
};
function beforeEach(fn) {
    cases[0][beforeeach] = fn;
}
function cleanState(init, runner = beforeEach) {
    const state = {};
    runner(() => {
        Object.assign(state, init());
    });
    return state;
}

async function execute(prefix = "", cases = rootCases()) {
    const beforeallfn = cases[beforeall] ?? (() => { });
    const beforeeachfn = cases[beforeeach] ?? (() => { });
    const afterallfn = cases[afterall] ?? (() => { });
    const aftereachfn = cases[aftereach] ?? (() => { });
    const result = { executed: 0, passed: 0, failed: 0, total: 0 };
    try {
        await beforeallfn();
    }
    catch (e) {
        result["_beforeAll"] = { error: e };
        return result;
    }
    for (const [title, block] of Object.entries(cases)) {
        if (typeof title === "symbol") {
            continue;
        }
        if (block instanceof Function) {
            try {
                result.executed += 1;
                await beforeeachfn();
                await block();
                await aftereachfn();
                result.passed += 1;
                result[title] = { passed: true };
            }
            catch (e) {
                result.failed += 1;
                result[title] = { error: /** @type Error */ e };
            }
        }
        else if (block) {
            const run = await execute(title, block);
            result.executed += run.executed;
            result.passed += run.passed;
            result.failed += run.failed;
            result[title] = run;
        }
    }
    try {
        await afterallfn();
    }
    catch (e) {
        result["_afterAll"] = { error: e };
    }
    return result;
}
function getError({ error }) {
    if (typeof error == "string") {
        return error;
    }
    else if (error.message) {
        return error.stack;
    }
    else {
        return "unknown error";
    }
}
function makeResult(test, result) {
    if (result.error)
        return [
            {
                test,
                stack: getError(result),
                stats: { executed: 1, failed: 1 },
            },
        ];
    if (result.passed === true) {
        return [{ test, stats: { executed: 1, failed: 0 } }];
    }
    return flattenResults(result, test);
}
function flattenResults(results, prefix = "") {
    const arrow = prefix == "" ? "" : " -> ";
    let errorList = [];
    for (const [title, result] of Object.entries(results).filter(([key]) => !["executed", "passed", "failed"].includes(key))) {
        const test = `${prefix}${arrow}${title}`;
        if (typeof result == "number")
            continue;
        const flatResult = makeResult(test, result);
        errorList = errorList.concat(flatResult);
    }
    return errorList;
}

const logger = getLogger();
function onConsole(results) {
    const { executed, failed } = results;
    logger.info("Executed test suite.", {
        executed,
        total: getTotalCases(),
        failed,
    });
    const flat = flattenResults(results);
    for (const { test } of flat) {
        logger.debug(test);
    }
    for (const { test, stack } of flat) {
        if (stack) {
            logger.error(test, { stack });
        }
    }
}

function compareArrays(equal) {
    return (a, b, partial = false) => a.length === b.length && a.every((e, i) => equal(e, b[i], partial));
}
const matchArrays = compareArrays(equals);
const matchObjects = (a, b, partial = true) => {
    for (const [k, v] of Object.entries(a)) {
        if (!b.hasOwnProperty(k) && partial)
            continue;
        // @ts-ignore
        if (!equals(v, b[k], partial))
            return false;
    }
    return true;
};
function equals(a, b, partial = false) {
    // runtime type checking
    switch (typeof a) {
        case "object":
            if (b === undefined) {
                return false;
            }
            if (a instanceof Array && b instanceof Array) {
                return matchArrays(a, b, partial);
            }
            else {
                return matchObjects(a, b, partial);
            }
        case "function":
            return a.name == b.name;
        default:
            return Object.is(a, b);
    }
}

class Matcher {
    actual;
    constructor(actual) {
        this.actual = actual;
    }
    get not() {
        return new NotMatcher(this.actual);
    }
    toBe(expected) {
        assert(this.actual === expected, () => `${this.actual} !== ${expected}`);
    }
    toEqual(expected, partial = false) {
        assert(equals(this.actual, expected, partial), () => `Objects are not equivalent: ${display(this.actual)}, ${display(expected)}`);
    }
    toMatch(expected) {
        assert(typeof this.actual === "string", () => "Must have string for regexp match");
        // @ts-expect-error
        const actual = this.actual;
        if (typeof expected === "string") {
            assert(actual.includes(expected), () => `${actual} does not include ${expected}`);
        }
        else {
            assert(expected.test(actual), () => `${actual} does not match ${expected}`);
        }
    }
    toMatchObject(expected) {
        for (const [k, v] of Object.entries(expected)) {
            // @ts-expect-error
            const actual = this.actual[k];
            assert(equals(actual, v, true), () => `Comparing ${k}, properties not equal: ${display(actual)}, ${display(v)}`);
        }
    }
    toBeNull() {
        assert(this.actual === null, () => `Expected null, got ${JSON.stringify(this.actual)}`);
    }
    toThrow(message = "") {
        let didThrow = false;
        let result = undefined;
        try {
            // @ts-expect-error
            result = this.actual();
        }
        catch ({ message: e }) {
            assert(
            // @ts-expect-error
            (e ?? "").match(message), () => `Expected thrown message to match ${message}, got ${e}`);
            didThrow = true;
        }
        assert(didThrow, () => `Expected throw but got ${JSON.stringify(result)}`);
    }
}
class NotMatcher {
    actual;
    constructor(actual) {
        this.actual = actual;
    }
    get not() {
        return new Matcher(this.actual);
    }
    toBe(expected) {
        assert(this.actual !== expected, () => `${this.actual} === ${expected}`);
    }
    toEqual(expected) {
        assert(!equals(this.actual, expected), () => `Objects are equivalent: ${JSON.stringify(this.actual)}, ${JSON.stringify(expected)}`);
    }
    toMatch(expected) {
        assert(typeof this.actual === "string", () => "Must have string for regexp match");
        // @ts-expect-error
        const actual = this.actual;
        if (typeof expected === "string") {
            assert(!actual.includes(expected), () => `${actual} includes ${expected}`);
        }
        else {
            assert(!expected.test(actual), () => `${actual} matches ${expected}`);
        }
    }
    toMatchObject(expected) {
        for (const [k, v] of Object.entries(expected)) {
            // @ts-expect-error
            const actual = this.actual[k];
            assert(!equals(actual, v), () => `Comparing ${k}, properties equal: ${JSON.stringify(actual)}, ${JSON.stringify(v)}`);
        }
    }
    toBeNull() {
        assert(this.actual !== null, () => `Expected not null`);
    }
    toThrow(message = "") {
        let didThrow = false;
        let result = undefined;
        try {
            // @ts-expect-error
            result = this.actual();
        }
        catch ({ message: e }) {
            assert(
            // @ts-expect-error
            (e ?? "").match(message), () => `Expected thrown message to match ${message}, got ${e}`);
            didThrow = true;
        }
        assert(!didThrow, () => `Expected throw but got ${JSON.stringify(result)}`);
    }
}
function expect(t) {
    return new Matcher(t);
}

describe("asm", () => {
    it("converts int16 to asm", () => {
        expect(asm(0x0000)).toBe("@0");
        expect(asm(12)).toBe("@12");
        expect(asm(60032)).toBe("0");
        expect(asm(64528)).toBe("D=M");
        expect(asm(58261)).toBe("D=D-1;JNE");
        expect(asm(60039)).toBe("0;JMP");
        expect(asm(64664)).toBe("MD=M-1");
    });
});

describe("twos", () => {
    it("formats as base 16", () => {
        // expect(bin(0)).toBe("0000 0000 0000 0000");
        // expect(bin(1)).toBe("0000 0000 0000 0001");
        // expect(bin(-1)).toBe("1111 1111 1111 1111");
        // expect(bin(256)).toBe("0000 0001 0000 0000");
        expect(bin(0)).toBe("0000000000000000");
        expect(bin(1)).toBe("0000000000000001");
        expect(bin(-1)).toBe("1111111111111111");
        expect(bin(256)).toBe("0000000100000000");
        expect(bin(6, 4)).toBe("0110");
        expect(dec(0)).toBe("0");
        expect(dec(1)).toBe("1");
        expect(dec(-1)).toBe("-1");
        expect(dec(256)).toBe("256");
        expect(hex(0)).toBe("0x0000");
        expect(hex(1)).toBe("0x0001");
        expect(hex(-1)).toBe("0xFFFF");
        expect(hex(256)).toBe("0x0100");
    });
    it("parses to integer", () => {
        expect(int2("0000000000000000")).toBe(0);
        expect(int2("0000000000000001")).toBe(1);
        expect(int2("1111111111111111")).toBe(-1);
        expect(int2("0000000100000000")).toBe(256);
        expect(int2("0000 0000 0000 0000")).toBe(0);
        expect(int2("0000 0000 0000 0001")).toBe(1);
        expect(int2("1111 1111 1111 1111")).toBe(-1);
        expect(int2("0000 0001 0000 0000")).toBe(256);
        expect(int10("0")).toBe(0);
        expect(int10("1")).toBe(1);
        expect(int10("-1")).toBe(-1);
        expect(int10("256")).toBe(256);
        expect(int16("0x0000")).toBe(0);
        expect(int16("0x0001")).toBe(1);
        expect(int16("0xffff")).toBe(-1);
        expect(int16("0xFFFF")).toBe(-1);
        expect(int16("0x0100")).toBe(256);
    });
    it("nands 16 bit numbers", () => {
        expect(nand16(0b0, 0b0)).toBe(65535);
        expect(nand16(0b1, 0b0)).toBe(65535);
        expect(nand16(0b0, 0b1)).toBe(65535);
        expect(nand16(0b1, 0b1)).toBe(65534);
        expect(nand16(43690, 21845)).toBe(65535);
        expect(nand16(61680, 61455)).toBe(4095);
        expect(nand16(1044720, 1044495)).toBe(4095);
    });
});

describe("cmp language", () => {
    it("parses a file into lines", () => {
        const parser = cmpParser;
        const parsed = parser(`| a | b | out |
| 0 | 0 | 0 |
| 1 | 0 | 1 |
| 0 | 1 | 1 |
| 1 | 1 | 0 |`);
        expect(parsed).toEqual(Ok([
            "",
            [
                [" a ", " b ", " out "],
                [" 0 ", " 0 ", " 0 "],
                [" 1 ", " 0 ", " 1 "],
                [" 0 ", " 1 ", " 1 "],
                [" 1 ", " 1 ", " 0 "],
            ],
        ]));
    });
});

const AND_BUILTIN = `CHIP And {
    IN a, b;
    OUT out;
    BUILTIN;
}`;
const NOT_PARTS = `CHIP Not {
    IN in;
    OUT out;
    PARTS:
    Nand(a=in, b=in, out=out);
}`;
const NOT_NO_PARTS = `CHIP Not {
    IN in;
    OUT out;
    PARTS:
}`;
const AND_16_BUILTIN = `CHIP And16 {
  IN a[16], b[16];
  OUT out[16];
  BUILTIN;
}`;
describe("hdl language", () => {
    it("parses comments", () => {
        let parsed;
        parsed = TEST_ONLY$1.hdlIdentifier("a // comment");
        expect(parsed).toEqual(Ok(["", "a"]));
        parsed = TEST_ONLY$1.hdlIdentifier(`/* multi
    line */ a // more`);
        expect(parsed).toEqual(Ok(["", "a"]));
    });
    it("parses pin wiring", () => {
        let parsed;
        parsed = TEST_ONLY$1.wire("a=a");
        expect(parsed).toEqual(Ok(["", [{ pin: "a" }, { pin: "a" }]]));
        parsed = TEST_ONLY$1.wire("b = /* to */ a // things");
        expect(parsed).toEqual(Ok(["", [{ pin: "b" }, { pin: "a" }]]));
        // parsed = TEST_ONLY.wire("b = 0");
        // expect(parsed).toEqual(Ok(["", [{ pin: "b", start: 0, end: 0 }, {pin: "0", start: 0, end: 0}]]));
        parsed = TEST_ONLY$1.wire("b = False");
        expect(parsed).toEqual(Ok(["", [{ pin: "b" }, { pin: "False" }]]));
        parsed = TEST_ONLY$1.wire("b = True");
        expect(parsed).toEqual(Ok(["", [{ pin: "b" }, { pin: "True" }]]));
        // parsed = TEST_ONLY.wire("b = Foo");
        // expect(isErr(parsed)).toBe(true);
    });
    it("parses a list of pins", () => {
        let parsed;
        let parser = list(TEST_ONLY$1.wire, tag(","));
        parsed = parser("a=a , b=b");
        expect(parsed).toEqual(Ok([
            "",
            [
                [{ pin: "a" }, { pin: "a" }],
                [{ pin: "b" }, { pin: "b" }],
            ],
        ]));
    });
    it("parses bus pins", () => {
        let parsed;
        let parser = TEST_ONLY$1.wire;
        parsed = parser("a[2..4]=b");
        expect(parsed).toEqual(Ok(["", [{ pin: "a", start: 2, end: 4 }, { pin: "b" }]]));
        parsed = parser("a=b[0]");
        expect(parsed).toEqual(Ok(["", [{ pin: "a" }, { pin: "b", start: 0, end: 0 }]]));
        parsed = parser("a=b[2]");
        expect(parsed).toEqual(Ok(["", [{ pin: "a" }, { pin: "b", start: 2, end: 2 }]]));
        parsed = parser("a[2..4]=b[10..12]");
        expect(parsed).toEqual(Ok([
            "",
            [
                { pin: "a", start: 2, end: 4 },
                { pin: "b", start: 10, end: 12 },
            ],
        ]));
    });
    it("parses a part", () => {
        let parsed;
        parsed = TEST_ONLY$1.part("Nand(a=a, b=b, out=out)");
        expect(parsed).toEqual(Ok([
            "",
            {
                name: "Nand",
                wires: [
                    {
                        lhs: { pin: "a" },
                        rhs: { pin: "a" },
                    },
                    {
                        lhs: { pin: "b" },
                        rhs: { pin: "b" },
                    },
                    {
                        lhs: { pin: "out" },
                        rhs: { pin: "out" },
                    },
                ],
            },
        ]));
    });
    it("parses a list of parts", () => {
        let parsed;
        parsed = TEST_ONLY$1.parts(`PARTS: Not(a=a, o=o); And(b=b, c=c, i=i);`);
        expect(parsed).toEqual(Ok([
            "",
            [
                {
                    name: "Not",
                    wires: [
                        {
                            lhs: { pin: "a" },
                            rhs: { pin: "a" },
                        },
                        {
                            lhs: { pin: "o" },
                            rhs: { pin: "o" },
                        },
                    ],
                },
                {
                    name: "And",
                    wires: [
                        {
                            lhs: { pin: "b" },
                            rhs: { pin: "b" },
                        },
                        {
                            lhs: { pin: "c" },
                            rhs: { pin: "c" },
                        },
                        {
                            lhs: { pin: "i" },
                            rhs: { pin: "i" },
                        },
                    ],
                },
            ],
        ]));
        parsed = TEST_ONLY$1.parts(`BUILTIN;`);
        expect(parsed).toEqual(Ok(["", "BUILTIN"]));
    });
    it("parses IN list", () => {
        let parsed;
        parsed = TEST_ONLY$1.inList(`IN a, b;`);
        expect(parsed).toEqual(Ok([
            "",
            [
                { pin: "a", width: 1 },
                { pin: "b", width: 1 },
            ],
        ]));
    });
    it("parses OUT list", () => {
        let parsed;
        parsed = TEST_ONLY$1.outList(`OUT out;`);
        expect(parsed).toEqual(Ok(["", [{ pin: "out", width: 1 }]]));
    });
    it("parses a file into a builtin", () => {
        const parsed = HdlParser(AND_BUILTIN);
        expect(parsed).toEqual(Ok([
            "",
            {
                name: "And",
                ins: [
                    { pin: "a", width: 1 },
                    { pin: "b", width: 1 },
                ],
                outs: [{ pin: "out", width: 1 }],
                parts: "BUILTIN",
            },
        ]));
    });
    it("parses a file with parts", () => {
        const parsed = HdlParser(NOT_PARTS);
        expect(parsed).toEqual(Ok([
            "",
            {
                name: "Not",
                ins: [{ pin: "in", width: 1 }],
                outs: [{ pin: "out", width: 1 }],
                parts: [
                    {
                        name: "Nand",
                        wires: [
                            {
                                lhs: { pin: "a" },
                                rhs: { pin: "in" },
                            },
                            {
                                lhs: { pin: "b" },
                                rhs: { pin: "in" },
                            },
                            {
                                lhs: { pin: "out" },
                                rhs: { pin: "out" },
                            },
                        ],
                    },
                ],
            },
        ]));
    });
    it("parses a file without parts", () => {
        const parsed = HdlParser(NOT_NO_PARTS);
        expect(parsed).toEqual(Ok([
            "",
            {
                name: "Not",
                ins: [{ pin: "in", width: 1 }],
                outs: [{ pin: "out", width: 1 }],
                parts: [],
            },
        ]));
    });
    it("Parses a file with 16-bit pins", () => {
        const parsed = HdlParser(AND_16_BUILTIN);
        expect(parsed).toEqual(Ok([
            "",
            {
                name: "And16",
                ins: [
                    { pin: "a", width: 16 },
                    { pin: "b", width: 16 },
                ],
                outs: [{ pin: "out", width: 16 }],
                parts: "BUILTIN",
            },
        ]));
    });
    describe("errors", () => {
        it("handles errors", () => {
            const parsed = HdlParser(new Span(`Chip And PARTS:`));
            assert(isErr(parsed));
        });
    });
});

const NOT_TST = `
output-list in%B3.1.3 out%B3.1.3;

set in 0, eval, output;
set in 1, eval, output;`;
describe("tst language", () => {
    it("parses values", () => {
        let parsed;
        parsed = TEST_ONLY.tstValue("%XFF");
        expect(parsed).toEqual(Ok(["", 255]));
        parsed = TEST_ONLY.tstValue("%D128");
        expect(parsed).toEqual(Ok(["", 128]));
        parsed = TEST_ONLY.tstValue("%127");
        expect(parsed).toEqual(Ok(["", 127]));
        parsed = TEST_ONLY.tstValue("%B11");
        expect(parsed).toEqual(Ok(["", 3]));
        parsed = TEST_ONLY.tstValue("%D-1");
        expect(parsed).toEqual(Ok(["", -1]));
        parsed = TEST_ONLY.tstValue("0");
        expect(parsed).toEqual(Ok(["", 0]));
    });
    it("parses an output format", () => {
        let parsed;
        parsed = TEST_ONLY.tstOutputFormat("a%B3.1.3");
        expect(parsed).toEqual(Ok(["", { id: "a", style: "B", width: 1, lpad: 3, rpad: 3 }]));
    });
    it("parses an output list", () => {
        let parsed;
        parsed = TEST_ONLY.tstOutputListParser("output-list a%B1.1.1 out%X2.3.4");
        expect(parsed).toEqual(Ok([
            "",
            {
                op: "output-list",
                spec: [
                    { id: "a", style: "B", width: 1, lpad: 1, rpad: 1 },
                    { id: "out", style: "X", width: 3, lpad: 2, rpad: 4 },
                ],
            },
        ]));
    });
    it("parses simple multiline", () => {
        let parsed;
        parsed = tstParser("eval;\n\neval;\n\n");
        expect(parsed).toEqual(Ok([
            "",
            { lines: [{ ops: [{ op: "eval" }] }, { ops: [{ op: "eval" }] }] },
        ]));
    });
    it("parses an output list with junk", () => {
        let parsed;
        parsed = TEST_ONLY.tstOutputListParser("\n/// A list\noutput-list a%B1.1.1 /* the output */ out%X2.3.4");
        expect(parsed).toEqual(Ok([
            "",
            {
                op: "output-list",
                spec: [
                    { id: "a", style: "B", width: 1, lpad: 1, rpad: 1 },
                    { id: "out", style: "X", width: 3, lpad: 2, rpad: 4 },
                ],
            },
        ]));
    });
    it("parses a single set", () => {
        let parsed;
        parsed = TEST_ONLY.set("set a 0");
        expect(parsed).toEqual(Ok(["", { op: "set", id: "a", value: 0 }]));
    });
    it("parses a test file", () => {
        let parsed;
        parsed = tstParser(NOT_TST);
        expect(parsed).toEqual(Ok([
            "",
            {
                lines: [
                    {
                        ops: [
                            {
                                op: "output-list",
                                spec: [
                                    { id: "in", style: "B", width: 1, lpad: 3, rpad: 3 },
                                    { id: "out", style: "B", width: 1, lpad: 3, rpad: 3 },
                                ],
                            },
                        ],
                    },
                    {
                        ops: [
                            { op: "set", id: "in", value: 0 },
                            { op: "eval" },
                            { op: "output" },
                        ],
                    },
                    {
                        ops: [
                            { op: "set", id: "in", value: 1 },
                            { op: "eval" },
                            { op: "output" },
                        ],
                    },
                ],
            },
        ]));
    });
});

describe("Parser Base", () => {
    describe("Span", () => {
        it("wraps a string", () => {
            const span = new Span("hello world");
            expect(span.toString()).toEqual("hello world");
            expect(span.substring(6).toString()).toEqual("world");
            expect(span.substring(2, 5).toString()).toEqual("llo");
        });
        it("tracks lines and columns", () => {
            let span = new Span(`Hello\nbig wide\nworld`);
            expect(span.pos).toBe(0);
            expect(span.line).toBe(1);
            expect(span.col).toBe(1);
            span = new Span(span, 6);
            expect(span.pos).toBe(6);
            expect(span.line).toBe(2);
            expect(span.col).toBe(1);
            span = new Span(span, 4);
            expect(span.pos).toBe(10);
            expect(span.line).toBe(2);
            expect(span.col).toBe(5);
            span = new Span(span, 5);
            expect(span.pos).toBe(15);
            expect(span.line).toBe(3);
            expect(span.col).toBe(1);
        });
    });
});

describe("TS Parser Combinator", () => {
    describe("branch", () => {
        it("branches with alt", () => {
            const parser = alt(alpha1(), digit1());
            expect(parser("abc")).toEqual(Ok(["", "abc"]));
            expect(parser("123456")).toEqual(Ok(["", "123456"]));
            expect(parser(" ")).toEqual(Err({
                context: { message: "alt did not match any branches.", span: " " },
                name: "ParseError",
            }));
        });
    });
});

describe("TS Parser Combinator", () => {
    describe("bytes", () => {
        it("takes bytes", () => {
            const parser = take(6);
            expect(parser("1234567")).toEqual(Ok(["7", "123456"]));
            expect(parser("things")).toEqual(Ok(["", "things"]));
            expect(parser("short")).toMatchObject(Err({ name: "Parse Incomplete", needed: 1 }));
        });
        it("consumes tags", () => {
            const parser = tag("Hello");
            expect(parser("Hello, world!")).toEqual(Ok([", world!", "Hello"]));
            expect(parser("Something")).toMatchObject(Err({ name: "ParseError", context: { cause: "tag 'Hello'" } }));
        });
    });
});

describe("Parser Recipes", () => {
    describe("comments", () => {
        it("parses EOL comments", () => {
            let parsed;
            parsed = eolComment("//")("// foo");
            expect(parsed).toEqual(Ok(["", "// foo"]));
            parsed = eolComment("//")("// foo\nnext line");
            expect(parsed).toEqual(Ok(["next line", "// foo\n"]));
            parsed = eolComment("//")("// foo\r\nnext line");
            expect(parsed).toEqual(Ok(["next line", "// foo\r\n"]));
        });
        it("parses multiline comments", () => {
            let parsed;
            const parser = comment("/*", "*/");
            parsed = parser("/* A multi\nline comment */");
            expect(parsed).toEqual(Ok(["", "/* A multi\nline comment */"]));
            parsed = parser("/** @brief */\nconst foo;");
            expect(parsed).toEqual(Ok(["\nconst foo;", "/** @brief */"]));
            parsed = parser("/* A multi */\nline comment */");
            expect(parsed).toEqual(Ok(["\nline comment */", "/* A multi */"]));
        });
    });
    describe("token", () => {
        it("Ignores space and comments around tokens", () => {
            let parsed;
            let parser = token(identifier());
            parsed = parser(" item_a   ");
            expect(parsed).toEqual(Ok(["", "item_a"]));
            parsed = parser("item_a   ");
            expect(parsed).toEqual(Ok(["", "item_a"]));
            parsed = parser("  item_a");
            expect(parsed).toEqual(Ok(["", "item_a"]));
            parsed = parser("/* @type */  item_a");
            expect(parsed).toEqual(Ok(["", "item_a"]));
            parsed = parser("item_a // foo");
            expect(parsed).toEqual(Ok(["", "item_a"]));
        });
    });
    describe("list", () => {
        it("parsers a list of identifiers", () => {
            let parsed;
            const idList = list(identifier(), token(","));
            parsed = idList("");
            expect(isErr(parsed)).toBe(true);
            parsed = idList("one_item");
            expect(parsed).toEqual(Ok(["", ["one_item"]]));
            parsed = idList("item_a, item_b");
            expect(parsed).toEqual(Ok(["", ["item_a", "item_b"]]));
            parsed = idList("item_a, item_b,");
            expect(parsed).toEqual(Ok(["", ["item_a", "item_b"]]));
            parsed = idList("item_a, item_b other_content");
            expect(parsed).toEqual(Ok([" other_content", ["item_a", "item_b"]]));
        });
    });
});

describe("Parser sequences", () => {
    describe("tuple", () => {
        it("parses a 1-tuple", () => {
            const parser = tuple(tag("a"));
            let parsed;
            parsed = parser("abcdef");
            expect(parsed).toEqual(Ok(["bcdef", ["a"]]));
        });
        it("parses a 2-tuple", () => {
            const parser = tuple(tag("a"), tag("b"));
            let parsed;
            parsed = parser("abcdef");
            expect(parsed).toEqual(Ok(["cdef", ["a", "b"]]));
        });
        it("parses a 3-tuple", () => {
            const parser = tuple(tag("a"), tag("b"), tag("c"));
            let parsed;
            parsed = parser("abcdef");
            expect(parsed).toEqual(Ok(["def", ["a", "b", "c"]]));
        });
        it("parses a 4-tuple", () => {
            const parser = tuple(tag("a"), tag("b"), tag("c"), tag("d"));
            let parsed;
            parsed = parser("abcdef");
            expect(parsed).toEqual(Ok(["ef", ["a", "b", "c", "d"]]));
        });
        it("parses a 5-tuple", () => {
            const parser = tuple(tag("a"), tag("b"), tag("c"), tag("d"), tag("e"));
            let parsed;
            parsed = parser("abcdef");
            expect(parsed).toEqual(Ok(["f", ["a", "b", "c", "d", "e"]]));
        });
    });
    describe("pair", () => {
        it("parses a pair", () => {
            const parser = pair(tag("a"), tag("b"));
            let parsed;
            parsed = parser("abc");
            expect(parsed).toEqual(Ok(["c", ["a", "b"]]));
            parsed = parser("bca");
            expect(isErr(parsed)).toBe(true);
            expect(parsed).toMatchObject(Err({ name: "ParseError", context: { cause: "tag 'a'" } }));
        });
    });
    describe("sequences", () => {
        it("parses a delimited value", () => {
            const parser = delimited(tag("a"), tag("b"), tag("c"));
            let parsed;
            parsed = parser("abc");
            expect(parsed).toEqual(Ok(["", "b"]));
        });
        it("parses a preceded value", () => {
            const parser = preceded(tag("a"), tag("b"));
            let parsed;
            parsed = parser("abc");
            expect(parsed).toEqual(Ok(["c", "b"]));
        });
        it("parses a terminated value", () => {
            const parser = terminated(tag("a"), tag("b"));
            let parsed;
            parsed = parser("abc");
            expect(parsed).toEqual(Ok(["c", "a"]));
        });
        it("parses separated values", () => {
            const parser = separated(tag("a"), tag("b"), tag("c"));
            let parsed;
            parsed = parser("abc");
            expect(parsed).toEqual(Ok(["", ["a", "c"]]));
        });
    });
});

describe("Chip", () => {
    it("parses toPin", () => {
        expect(parseToPin("a")).toMatchObject({ pin: "a" });
        expect(parseToPin("a[2]")).toMatchObject({ pin: "a", start: 2 });
        expect(parseToPin("a[2..4]")).toMatchObject({
            pin: "a",
            start: 2,
            end: 4,
        });
    });
    describe("combinatorial", () => {
        describe("nand", () => {
            it("can eval a nand gate", () => {
                const nand = new Nand();
                nand.eval();
                expect(nand.out().voltage()).toBe(HIGH);
                nand.in("a")?.pull(HIGH);
                nand.eval();
                expect(nand.out().voltage()).toBe(HIGH);
                nand.in("b")?.pull(HIGH);
                nand.eval();
                expect(nand.out().voltage()).toBe(LOW);
                nand.in("a")?.pull(LOW);
                nand.eval();
                expect(nand.out().voltage()).toBe(HIGH);
            });
        });
        describe("not", () => {
            it("evaluates a not gate", () => {
                const notChip = new Not();
                notChip.eval();
                expect(notChip.out().voltage()).toBe(HIGH);
                notChip.in().pull(HIGH);
                notChip.eval();
                expect(notChip.out().voltage()).toBe(LOW);
            });
        });
        describe("and", () => {
            it("evaluates an and gate", () => {
                const andChip = new And();
                const a = andChip.in("a");
                const b = andChip.in("b");
                andChip.eval();
                expect(andChip.out().voltage()).toBe(LOW);
                a.pull(HIGH);
                andChip.eval();
                expect(andChip.out().voltage()).toBe(LOW);
                b.pull(HIGH);
                andChip.eval();
                expect(andChip.out().voltage()).toBe(HIGH);
                a.pull(LOW);
                andChip.eval();
                expect(andChip.out().voltage()).toBe(LOW);
            });
        });
        describe("or", () => {
            it("evaluates an or gate", () => {
                const orChip = new Or();
                const a = orChip.in("a");
                const b = orChip.in("b");
                orChip.eval();
                expect(orChip.out().voltage()).toBe(LOW);
                a.pull(HIGH);
                orChip.eval();
                printChip(orChip);
                expect(orChip.out().voltage()).toBe(HIGH);
                b.pull(HIGH);
                orChip.eval();
                expect(orChip.out().voltage()).toBe(HIGH);
                a.pull(LOW);
                orChip.eval();
                expect(orChip.out().voltage()).toBe(HIGH);
            });
        });
        describe("xor", () => {
            it("evaluates an xor gate", () => {
                const xorChip = new Xor();
                const a = xorChip.in("a");
                const b = xorChip.in("b");
                xorChip.eval();
                expect(xorChip.out().voltage()).toBe(LOW);
                a.pull(HIGH);
                xorChip.eval();
                expect(xorChip.out().voltage()).toBe(HIGH);
                b.pull(HIGH);
                xorChip.eval();
                expect(xorChip.out().voltage()).toBe(LOW);
                a.pull(LOW);
                xorChip.eval();
                expect(xorChip.out().voltage()).toBe(HIGH);
            });
        });
    });
    describe("wide", () => {
        describe("Not16", () => {
            it("evaluates a not16 gate", () => {
                const not16 = new Not16();
                const inn = not16.in();
                inn.busVoltage = 0x0;
                not16.eval();
                expect(not16.out().busVoltage).toBe(0xffff);
                inn.busVoltage = 0xf00f;
                not16.eval();
                expect(not16.out().busVoltage).toBe(0x0ff0);
            });
        });
        describe("bus voltage", () => {
            it("sets and returns wide busses", () => {
                const pin = new Bus("wide", 16);
                pin.busVoltage = 0xf00f;
                expect(pin.voltage(0)).toBe(1);
                expect(pin.voltage(8)).toBe(0);
                expect(pin.voltage(9)).toBe(0);
                expect(pin.voltage(15)).toBe(1);
                expect(pin.busVoltage).toBe(0xf00f);
            });
            it("creates wide busses internally", () => {
                const chip = new Chip$1([], [], "WithWide");
                chip.wire(new Not16(), [
                    {
                        to: { name: "out", start: 0, width: 16 },
                        from: { name: "a", start: 0, width: 16 },
                    },
                ]);
                const width = chip.pins.get("a")?.width;
                expect(width).toBe(16);
            });
        });
        describe("and16", () => { });
    });
    describe("SubBus", () => {
        class Not3 extends Chip$1 {
            constructor() {
                super(["in[3]"], ["out[3]"]);
            }
            eval() {
                const inn = this.in().busVoltage;
                const out = ~inn & 0b11;
                this.out().busVoltage = out;
            }
        }
        it("drives InSubBus", () => {
            const chipPin = new Bus("in", 3);
            const notChip = new Not();
            const inSubBus = new InSubBus(notChip.in(), 1, 1);
            inSubBus.connect(notChip.in());
            chipPin.busVoltage = 0b0;
            expect(notChip.in().busVoltage).toBe(0b0);
            chipPin.busVoltage = 0b111;
            expect(notChip.in().busVoltage).toBe(0b1);
        });
        it("drives OutSubBus", () => {
            const notChip = new Not();
            const inPin = new Bus("in", 3);
            const outSubBus = new OutSubBus(notChip.in(), 1, 1);
            inPin.connect(outSubBus);
            inPin.busVoltage = 0b0;
            expect(notChip.in().busVoltage).toBe(0b0);
            inPin.busVoltage = 0b111;
            expect(notChip.in().busVoltage).toBe(0b1);
        });
        it("wires SubBus in=in[1]", () => {
            const not3Chip = new Not3();
            const notPart = new Not();
            const inPin = not3Chip.in();
            not3Chip.wire(notPart, [
                {
                    from: { name: "in", start: 1, width: 1 },
                    to: { name: "in", start: 0, width: 1 },
                },
            ]);
            inPin.busVoltage = 0b0;
            expect(notPart.in().busVoltage).toBe(0b0);
            inPin.busVoltage = 0b111;
            expect(notPart.in().busVoltage).toBe(0b1);
        });
        it("wires SubBus out=out[1]", () => {
            const not3Chip = new Not3();
            const notPart = new Not();
            const outPin = notPart.out();
            not3Chip.wire(notPart, [
                {
                    from: { name: "out", start: 1, width: 1 },
                    to: { name: "out", start: 0, width: 1 },
                },
            ]);
            outPin.busVoltage = 0b0;
            expect(not3Chip.out().busVoltage).toBe(0b0);
            outPin.busVoltage = 0b1;
            expect(not3Chip.out().busVoltage).toBe(0b010);
        });
        class Not8 extends Chip$1 {
            constructor() {
                super(["in[8]"], ["out[8]"]);
            }
            eval() {
                const inn = this.in().busVoltage;
                const out = ~inn & 0xff;
                this.out().busVoltage = out;
            }
        }
        it("assigns input inside wide busses", () => {
            class Foo extends Chip$1 {
                not8 = new Not8();
                constructor() {
                    super([], []);
                    this.parts.add(this.not8);
                    this.pins.insert(new ConstantBus("pal", 44085));
                    this.pins.get("pal")?.connect(new OutSubBus(this.not8.in(), 4, 8));
                    this.pins.emplace("out1", 5);
                    const out1Bus = new OutSubBus(this.pins.get("out1"), 3, 5);
                    this.not8.out().connect(out1Bus);
                }
            }
            const foo = new Foo();
            foo.eval();
            expect(foo.not8.in().busVoltage).toEqual(195);
            expect(foo.pin("out1")?.busVoltage).toEqual(0b00111);
        });
        it("assigns output inside wide busses", () => {
            // From figure A2.2, page 287, 2nd edition
            class Foo extends Chip$1 {
                not8 = new Not8();
                constructor() {
                    super([], []);
                    this.parts.add(this.not8);
                    this.pins.insert(new ConstantBus("six", 0b110));
                    // in[0..1] = true
                    TRUE_BUS.connect(new InSubBus(this.not8.in(), 0, 2));
                    // in[3..5] = six, 110
                    this.pins.get("six")?.connect(new InSubBus(this.not8.in(), 3, 3));
                    // in[7] = true
                    TRUE_BUS.connect(new InSubBus(this.not8.in(), 7, 1));
                    // out[3..7] = out1
                    this.pins.emplace("out1", 5);
                    const out1Bus = new OutSubBus(this.pins.get("out1"), 3, 5);
                    this.not8.out().connect(out1Bus);
                }
            }
            const foo = new Foo();
            foo.eval();
            expect(foo.not8.in().busVoltage).toBe(0b10110011);
            expect(foo.pin("out1").busVoltage).toBe(0b01001);
        });
        it("pulls portions of true", () => {
            class Foo extends Chip$1 {
                chip = new Not3();
                constructor() {
                    super([], []);
                    this.wire(this.chip, [
                        {
                            from: { name: "true", start: 0, width: 1 },
                            to: { name: "in", start: 1, width: 2 },
                        },
                    ]);
                }
            }
            const foo = new Foo();
            const inVoltage = foo.chip.in().busVoltage;
            expect(bin(inVoltage)).toBe(bin(0b110));
        });
        it("pulls start of true", () => {
            class Foo extends Chip$1 {
                chip = new Not3();
                constructor() {
                    super([], []);
                    this.wire(this.chip, [
                        {
                            from: { name: "true", start: 0, width: 1 },
                            to: { name: "in", start: 0, width: 2 },
                        },
                    ]);
                }
            }
            const foo = new Foo();
            const inVoltage = foo.chip.in().busVoltage;
            expect(bin(inVoltage)).toBe(bin(0b11));
        });
    });
    describe("sequential", () => {
        describe("dff", () => {
            it("flips and flops", () => {
                const dff = new DFF();
                dff.tick();
                expect(dff.out().voltage()).toBe(LOW);
                dff.tock();
                expect(dff.out().voltage()).toBe(LOW);
                dff.tick();
                expect(dff.out().voltage()).toBe(LOW);
                dff.in().pull(HIGH);
                dff.tock();
                expect(dff.out().voltage()).toBe(LOW);
                dff.tick();
                expect(dff.out().voltage()).toBe(LOW);
                dff.tock();
                expect(dff.out().voltage()).toBe(HIGH);
            });
        });
    });
});

describe("Chip Builder", () => {
    it("builds a chip from a string", () => {
        const nand = unwrap(parse(`CHIP Not { IN in; OUT out; PARTS: Nand(a=in, b=in, out=out); }`));
        nand.in().pull(LOW);
        nand.eval();
        expect(nand.out().voltage()).toBe(HIGH);
        nand.in().pull(HIGH);
        nand.eval();
        expect(nand.out().voltage()).toBe(LOW);
    });
    it("builds and evals a chip with subbus components", () => {
        let foo;
        try {
            foo = unwrap(parse(`CHIP Foo {
          IN six[3];
          OUT out;
          PARTS: Not16(
            in[0..1] = true,
            in[3..5] = six,
            in[7] = true,
            // out[3..7] = out1,
            );
          }`));
        }
        catch (e) {
            throw new Error(display(e));
        }
        const six = foo.in("six");
        six.busVoltage = 6;
        foo.eval();
        const inVoltage = [...foo.parts][0].in().busVoltage;
        expect(bin(inVoltage)).toBe(bin(0b10110011));
        // const outVoltage = foo.pin("out1").busVoltage;
        // expect(outVoltage).toBe(0b01001);
        // expect(outVoltage).toBe(0b11001);
    });
    it("builds and evals a chip with subpins", () => {
        let foo;
        try {
            foo = unwrap(parse(`
        CHIP Not2 {
          IN in[2];
          OUT out[2];
          PARTS:
          Not(in=in[0], out=out[0]);
          Not(in=in[1], out=out[1]);
        }
      `));
        }
        catch (e) {
            throw new Error(display(e));
        }
        foo.in().busVoltage = 0b00;
        foo.eval();
        expect(foo.out().busVoltage).toBe(0b11);
        foo.in().busVoltage = 0b11;
        foo.eval();
        expect(foo.out().busVoltage).toBe(0b00);
    });
    it("builds and evals a chip with subbus components on the right", () => {
        let foo;
        try {
            foo = unwrap(parse(`CHIP Foo {
          IN in[16];
          OUT out[5];
          PARTS: Not16(
            in[0..7] = in[4..11],
            // in[8..15] = false,
            out[3..5] = out[1..3],
            );
          }`));
        }
        catch (e) {
            throw new Error(display(e));
        }
        foo.in().busVoltage = 44085;
        foo.eval();
        const inVoltage = [...foo.parts][0].in().busVoltage;
        const outVoltage = foo.out().busVoltage;
        expect(bin(inVoltage)).toBe(bin(0b11000011));
        expect(bin(outVoltage)).toBe(bin(0b01110));
    });
});

describe("alu", () => {
    it("calculates", () => {
        expect(alu(COMMANDS.asm["0"], 123, 456)).toEqual([0, Flags.Zero]);
        expect(alu(COMMANDS.asm["D+A"], 123, 456)).toEqual([579, Flags.Positive]);
        expect(alu(COMMANDS.asm["D-A"], 123, 456)).toEqual([
            -333 & 0xffff,
            Flags.Negative,
        ]);
        expect(alu(COMMANDS.asm["A-D"], 123, 456)).toEqual([333, Flags.Positive]);
        expect(alu(COMMANDS.asm["D&A"], 0b1010, 0b1101)).toEqual([
            0b1000,
            Flags.Positive,
        ]);
        expect(alu(COMMANDS.asm["D|A"], 0b1010, 0b1101)).toEqual([
            0b1111,
            Flags.Positive,
        ]);
    });
});

describe("CPU", () => {
    it("executes instructions", () => {
        const RAM = new Memory$1(256);
        RAM.set(0, 2);
        RAM.set(1, 3);
        const ROM = new Memory$1(HACK);
        const cpu = new CPU$1({ RAM, ROM });
        for (let i = 0; i < 100; i++) {
            cpu.tick();
        }
        expect(RAM.get(2)).toBe(6);
    });
});

const a = `| 0 | 0 | 0 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 0 |`;
const b = `| 0 | 0 | 0 |
| 0 | 1 | 0 |
| 1 | 0 | 0 |
| 1 | 1 | 1 |`;
describe("compare", () => {
    it("diffs a row", () => {
        const as = ["a", "b", "c"];
        const bs = ["a", "d", "c"];
        const diffs = diff(as, bs);
        expect(diffs).toEqual([{ a: "b", b: "d", col: 1 }]);
    });
    it("diffs a block", () => {
        const as = [
            ["0", "0", "0"],
            ["0", "1", "1"],
            ["1", "0", "1"],
            ["1", "1", "0"],
        ];
        const bs = [
            ["0", "0", "0"],
            ["0", "1", "0"],
            ["1", "0", "0"],
            ["1", "1", "1"],
        ];
        const diffs = compare(as, bs);
        expect(diffs).toEqual([
            { a: "1", b: "0", row: 1, col: 2 },
            { a: "1", b: "0", row: 2, col: 2 },
            { a: "0", b: "1", row: 3, col: 2 },
        ]);
    });
    it("diffs parsed strings", () => {
        const as = unwrap(cmpParser(a))[1];
        const bs = unwrap(cmpParser(b))[1];
        const diffs = compare(as, bs);
        expect(diffs).toEqual([
            { a: " 1 ", b: " 0 ", row: 1, col: 2 },
            { a: " 1 ", b: " 0 ", row: 2, col: 2 },
            { a: " 0 ", b: " 1 ", row: 3, col: 2 },
        ]);
    });
});

class OutputTest extends Test$1 {
    vars;
    constructor(init) {
        super();
        this.vars = new Map(init);
    }
    hasVar(variable) {
        return this.vars.has(`${variable}`);
    }
    getVar(variable) {
        return this.vars.get(`${variable}`) ?? 0;
    }
    setVar(variable, value) {
        this.vars.set(`${variable}`, value);
    }
}
describe("Test Output Handler", () => {
    const state = cleanState(() => ({
        test: new OutputTest([
            ["a", 1],
            ["b", 20],
            ["in", 0],
            ["out", -1],
        ]),
    }));
    it("outputs padded values", () => {
        const outA = new Output("a", "D", 1, 3, 3);
        const a = outA.print(state.test);
        expect(a).toEqual("   1   ");
    });
    it("outputs 16 bit values", () => {
        const outB = new Output("b", "B", 16, 1, 1);
        const b = outB.print(state.test);
        expect(b).toEqual(" 0000000000010100 ");
    });
    it("outputs a line", () => {
        state.test.outputList([
            new Output("a", "D", 1, 2, 2),
            new Output("b", "X", 6, 1, 1),
            new Output("in", "B", 2, 2, 2),
            new Output("out", "B", 4, 2, 2),
        ]);
        state.test.addInstruction(new TestOutputInstruction());
        state.test.run();
        expect(state.test.log()).toEqual("|  1  | 0x0014 |  00  |  1111  |\n");
    });
    it("outputs 16 bit", () => {
        const test = new OutputTest([
            ["a", 0b0001001000110100],
            ["b", 0b1001100001110110],
        ]);
        test.outputList([
            new Output("a", "B", 16, 1, 1),
            new Output("b", "B", 16, 1, 1),
        ]);
        test.addInstruction(new TestOutputInstruction());
        test.run();
        expect(test.log()).toEqual("| 0001001000110100 | 1001100001110110 |\n");
    });
    it("outputs a header for 16 bit", () => {
        const outB = new Output("b", "B", 16, 1, 1);
        const b = outB.header(state.test);
        expect(b).toEqual("        b         ");
    });
});

describe("Simulator Test", () => {
    it("creates a simulator test", () => {
        const test = new ChipTest();
        test.outputList(["a", "b", "out"].map((v) => new Output(v)));
        [
            new TestSetInstruction("a", 0),
            new TestSetInstruction("b", 0),
            new TestEvalInstruction(),
            new TestOutputInstruction(),
        ].forEach((i) => test.addInstruction(i));
        [
            new TestSetInstruction("a", 1),
            new TestSetInstruction("b", 1),
            new TestEvalInstruction(),
            new TestOutputInstruction(),
        ].forEach((i) => test.addInstruction(i));
        [
            new TestSetInstruction("a", 1),
            new TestSetInstruction("b", 0),
            new TestEvalInstruction(),
            new TestOutputInstruction(),
        ].forEach((i) => test.addInstruction(i));
        [
            new TestSetInstruction("a", 0),
            new TestSetInstruction("b", 1),
            new TestEvalInstruction(),
            new TestOutputInstruction(),
        ].forEach((i) => test.addInstruction(i));
        test.run();
        expect(test.log()).toEqual(`| 0 | 0 | 1 |\n| 1 | 1 | 0 |\n| 1 | 0 | 1 |\n| 0 | 1 | 1 |\n`);
    });
});

function displayStatistics(results, root) {
    const { executed, failed } = results;
    root.appendChild(div(`Executed ${executed} of ${getTotalCases()}; ${failed} failed.`));
    const flat = flattenResults(results);
    for (const { test, stack } of flat) {
        if (stack) {
            root.appendChild(details(summary(code({ style: { width: "calc(100% - 1.5rem)" } }, test)), pre(code(display(stack)))));
        }
    }
}
const Test = () => {
    const root = article(header("Tests"));
    (async function test() {
        const results = await execute();
        displayStatistics(results, root);
        onConsole(results);
    })();
    return root;
};

const VM = () => article(header(h2("VM")));

var urls = [
    { href: "chip", link: "Chip", target: Chip },
    { href: "cpu", link: "CPU", target: CPU },
    { href: "vm", link: "VM", target: VM },
    { href: "test", link: "Tests", target: Test },
];

const cmp$s = `|  in   |  out  |
|   0   |   1   |
|   1   |   0   |`;
const hdl$s = `// Not gate: out = not in

CHIP Not {
    IN in;
    OUT out;

    PARTS:
}`;
const tst$s = `
output-list in%B3.1.3 out%B3.1.3;

set in 0, eval, output;
set in 1, eval, output;`;

const hdl$r = `/**
 * And gate: out = 1 if {a==1 and b==1}, 0 otherwise
 * And gate: if {a==1 and b==1} then out = 1 else out = 0
 */

CHIP And {
    IN a, b;
    OUT out;

    PARTS:
}`;
const tst$r = `output-list a%B3.1.3 b%B3.1.3 out%B3.1.3;
set a 0, set b 0, eval, output;
set a 0, set b 1, eval, output;
set a 1, set b 0, eval, output;
set a 1, set b 1, eval, output;`;
const cmp$r = `|   a   |   b   |  out  |
|   0   |   0   |   0   |
|   0   |   1   |   0   |
|   1   |   0   |   0   |
|   1   |   1   |   1   |`;

const cmp$q = `|   a   |   b   |  out  |
|   0   |   0   |   0   |
|   0   |   1   |   1   |
|   1   |   0   |   1   |
|   1   |   1   |   1   |`;
const hdl$q = `/**
 * Or gate: out = 1 if {a==1 or b==1}, 0 otherwise
 */

CHIP Or {
    IN a, b;
    OUT out;

    PARTS:
}`;
const tst$q = `output-list a%B3.1.3 b%B3.1.3 out%B3.1.3;

set a 0, set b 0, eval, output;
set a 0, set b 1, eval, output;
set a 1, set b 0, eval, output;
set a 1, set b 1, eval, output;`;

const cmp$p = `|   a   |   b   |  out  |
|   0   |   0   |   0   |
|   0   |   1   |   1   |
|   1   |   0   |   1   |
|   1   |   1   |   0   |`;
const hdl$p = `/**
 *  Exclusive-or gate: out = !(a == b).
 */

CHIP XOr {
    IN a, b;
    OUT out;

    PARTS:
}`;
const tst$p = `output-list a%B3.1.3 b%B3.1.3 out%B3.1.3;

set a 0, set b 0, eval, output;
set a 0, set b 1, eval, output;
set a 1, set b 0, eval, output;
set a 1, set b 1, eval, output;`;

const cmp$o = `|   a   |   b   |  sel  |  out  |
|   0   |   0   |   0   |   0   |
|   0   |   0   |   1   |   0   |
|   0   |   1   |   0   |   0   |
|   0   |   1   |   1   |   1   |
|   1   |   0   |   0   |   1   |
|   1   |   0   |   1   |   0   |
|   1   |   1   |   0   |   1   |
|   1   |   1   |   1   |   1   |`;
const hdl$o = `/** 
 * Multiplexor. If sel==1 then out=b else out=a.
 */

CHIP Mux {
    IN a, b, sel;
    OUT out;

    PARTS:
}`;
const tst$o = `output-list a%B3.1.3 b%B3.1.3 sel%B3.1.3 out%B3.1.3;

set a 0, set b 0, set sel 0, eval, output;
set sel 1, eval, output;

set a 0, set b 1, set sel 0, eval, output;
set sel 1, eval, output;

set a 1, set b 0, set sel 0, eval, output;
set sel 1, eval, output;

set a 1, set b 1, set sel 0, eval, output;
set sel 1, eval, output;`;

const hdl$n = `/**
 * Demultiplexor.
 * {a,b} = {in,0} if sel==0
 *         {0,in} if sel==1
 */

CHIP DMux {
    IN in, sel;
    OUT a, b;

    PARTS:
}`;
const tst$n = `output-list in%B3.1.3 sel%B3.1.3 a%B3.1.3 b%B3.1.3;

set in 0, set sel 0, eval, output;
set sel 1, eval, output;

set in 1, set sel 0, eval, output;
set sel 1, eval, output;`;
const cmp$n = `|  in   |  sel  |   a   |   b   |
|   0   |   0   |   0   |   0   |
|   0   |   1   |   0   |   0   |
|   1   |   0   |   1   |   0   |
|   1   |   1   |   0   |   1   |`;

const hdl$m = `// 16-bit Not gate: for i=0..15: out[i] = not in[i]

CHIP Not16 {
   IN in[16];
   OUT out[16];

   PARTS:
}`;
const tst$m = `output-list in%B1.16.1 out%B1.16.1;
set in %B0000000000000000, eval, output;
set in %B1111111111111111, eval, output;
set in %B1010101010101010, eval, output;
set in %B0011110011000011, eval, output;
set in %B0001001000110100, eval, output;`;
const cmp$m = `|        in        |       out        |
| 0000000000000000 | 1111111111111111 |
| 1111111111111111 | 0000000000000000 |
| 1010101010101010 | 0101010101010101 |
| 0011110011000011 | 1100001100111100 |
| 0001001000110100 | 1110110111001011 |`;

const hdl$l = `// 16-bit-wise and gate: for i = 0..15: out[i] = a[i] and b[i]

CHIP And16 {
    IN a[16], b[16];
    OUT out[16];

    PARTS:
}`;
const tst$l = `output-list a%B1.16.1 b%B1.16.1 out%B1.16.1;

set a %B0000000000000000, set b %B0000000000000000, eval, output;
set a %B0000000000000000, set b %B1111111111111111, eval, output;
set a %B1111111111111111, set b %B1111111111111111, eval, output;
set a %B1010101010101010, set b %B0101010101010101, eval, output;
set a %B0011110011000011, set b %B0000111111110000, eval, output;
set a %B0001001000110100, set b %B1001100001110110, eval, output;`;
const cmp$l = `|        a         |        b         |       out        |
| 0000000000000000 | 0000000000000000 | 0000000000000000 |
| 0000000000000000 | 1111111111111111 | 0000000000000000 |
| 1111111111111111 | 1111111111111111 | 1111111111111111 |
| 1010101010101010 | 0101010101010101 | 0000000000000000 |
| 0011110011000011 | 0000111111110000 | 0000110011000000 |
| 0001001000110100 | 1001100001110110 | 0001000000110100 |`;

const cmp$k = `|        a         |        b         |       out        |
| 0000000000000000 | 0000000000000000 | 0000000000000000 |
| 0000000000000000 | 1111111111111111 | 1111111111111111 |
| 1111111111111111 | 1111111111111111 | 1111111111111111 |
| 1010101010101010 | 0101010101010101 | 1111111111111111 |
| 0011110011000011 | 0000111111110000 | 0011111111110011 |
| 0001001000110100 | 1001100001110110 | 1001101001110110 |`;
const hdl$k = `// 16-bit bitwise Or gate: for i=0..15 out[i] = a[i] or b[i].

CHIP Or16 {
    IN a[16], b[16];
    OUT out[16];

    PARTS:
}`;
const tst$k = `output-list a%B1.16.1 b%B1.16.1 out%B1.16.1;
set a %B0000000000000000, set b %B0000000000000000, eval, output;
set a %B0000000000000000, set b %B1111111111111111, eval, output;
set a %B1111111111111111, set b %B1111111111111111, eval, output;
set a %B1010101010101010, set b %B0101010101010101, eval, output;
set a %B0011110011000011, set b %B0000111111110000, eval, output;
set a %B0001001000110100, set b %B1001100001110110, eval, output;`;

const cmp$j = `|        a         |        b         | sel |       out        |
| 0000000000000000 | 0000000000000000 |  0  | 0000000000000000 |
| 0000000000000000 | 0000000000000000 |  1  | 0000000000000000 |
| 0000000000000000 | 0001001000110100 |  0  | 0000000000000000 |
| 0000000000000000 | 0001001000110100 |  1  | 0001001000110100 |
| 1001100001110110 | 0000000000000000 |  0  | 1001100001110110 |
| 1001100001110110 | 0000000000000000 |  1  | 0000000000000000 |
| 1010101010101010 | 0101010101010101 |  0  | 1010101010101010 |
| 1010101010101010 | 0101010101010101 |  1  | 0101010101010101 |`;
const hdl$j = `// 16 bit multiplexor. If sel==1 then out=b else out=a.

CHIP Mux16 {
    IN a[16], b[16], sel;
    OUT out[16];

    PARTS:
}`;
const tst$j = `output-list a%B1.16.1 b%B1.16.1 sel%D2.1.2 out%B1.16.1;

set a 0, set b 0, set sel 0, eval, output;
set sel 1, eval, output;

set a %B0000000000000000, set b %B0001001000110100, set sel 0, eval, output;
set sel 1, eval, output;

set a %B1001100001110110, set b %B0000000000000000, set sel 0, eval, output;
set sel 1, eval, output;

set a %B1010101010101010, set b %B0101010101010101, set sel 0, eval, output;
set sel 1, eval, output;`;

const cmp$i = `|        a         |        b         |        c         |        d         | sel  |       out        |
| 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 |  00  | 0000000000000000 |
| 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 |  01  | 0000000000000000 |
| 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 |  10  | 0000000000000000 |
| 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 |  11  | 0000000000000000 |
| 0001001000110100 | 1001100001110110 | 1010101010101010 | 0101010101010101 |  00  | 0001001000110100 |
| 0001001000110100 | 1001100001110110 | 1010101010101010 | 0101010101010101 |  01  | 1001100001110110 |
| 0001001000110100 | 1001100001110110 | 1010101010101010 | 0101010101010101 |  10  | 1010101010101010 |
| 0001001000110100 | 1001100001110110 | 1010101010101010 | 0101010101010101 |  11  | 0101010101010101 |`;
const hdl$i = `/**
 * 4-way 16-bit multiplexor.
 * out = a if sel==00
 *       b if sel==01
 *       c if sel==10
 *       d if sel==11
 */

CHIP Mux4Way16 {
    IN a[16], b[16], c[16], d[16], sel[2];
    OUT out[16];

    PARTS:
}`;
const tst$i = `output-list a%B1.16.1 b%B1.16.1 c%B1.16.1 d%B1.16.1 sel%B2.2.2 out%B1.16.1;

set a 0, set b 0, set c 0, set d 0, set sel 0, eval, output;
set sel 1, eval, output;
set sel 2, eval, output;
set sel 3, eval, output;

set a %B0001001000110100, set b %B1001100001110110, set c %B1010101010101010, set d %B0101010101010101, set sel 0, eval, output;
set sel 1, eval, output;
set sel 2, eval, output;
set sel 3, eval, output;`;

const cmp$h = `|        a         |        b         |        c         |        d         |        e         |        f         |        g         |        h         |  sel  |       out        |
| 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 |  000  | 0000000000000000 |
| 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 |  001  | 0000000000000000 |
| 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 |  010  | 0000000000000000 |
| 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 |  011  | 0000000000000000 |
| 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 |  100  | 0000000000000000 |
| 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 |  101  | 0000000000000000 |
| 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 |  110  | 0000000000000000 |
| 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 |  111  | 0000000000000000 |
| 0001001000110100 | 0010001101000101 | 0011010001010110 | 0100010101100111 | 0101011001111000 | 0110011110001001 | 0111100010011010 | 1000100110101011 |  000  | 0001001000110100 |
| 0001001000110100 | 0010001101000101 | 0011010001010110 | 0100010101100111 | 0101011001111000 | 0110011110001001 | 0111100010011010 | 1000100110101011 |  001  | 0010001101000101 |
| 0001001000110100 | 0010001101000101 | 0011010001010110 | 0100010101100111 | 0101011001111000 | 0110011110001001 | 0111100010011010 | 1000100110101011 |  010  | 0011010001010110 |
| 0001001000110100 | 0010001101000101 | 0011010001010110 | 0100010101100111 | 0101011001111000 | 0110011110001001 | 0111100010011010 | 1000100110101011 |  011  | 0100010101100111 |
| 0001001000110100 | 0010001101000101 | 0011010001010110 | 0100010101100111 | 0101011001111000 | 0110011110001001 | 0111100010011010 | 1000100110101011 |  100  | 0101011001111000 |
| 0001001000110100 | 0010001101000101 | 0011010001010110 | 0100010101100111 | 0101011001111000 | 0110011110001001 | 0111100010011010 | 1000100110101011 |  101  | 0110011110001001 |
| 0001001000110100 | 0010001101000101 | 0011010001010110 | 0100010101100111 | 0101011001111000 | 0110011110001001 | 0111100010011010 | 1000100110101011 |  110  | 0111100010011010 |
| 0001001000110100 | 0010001101000101 | 0011010001010110 | 0100010101100111 | 0101011001111000 | 0110011110001001 | 0111100010011010 | 1000100110101011 |  111  | 1000100110101011 |`;
const hdl$h = `/**
 * 8-way 16-bit multiplexor.
 * out = a if sel==000
 *       b if sel==001
 *       etc.
 *       h if sel==111
 */

CHIP Mux8Way16 {
    IN a[16], b[16], c[16], d[16],
       e[16], f[16], g[16], h[16],
       sel[3];
    OUT out[16];

    PARTS:
}`;
const tst$h = `output-list a%B1.16.1 b%B1.16.1 c%B1.16.1 d%B1.16.1 e%B1.16.1 f%B1.16.1 g%B1.16.1 h%B1.16.1 sel%B2.3.2 out%B1.16.1;

set a 0, set b 0, set c 0, set d 0, set e 0, set f 0, set g 0, set h 0, set sel 0, eval, output;
set sel 1, eval, output;
set sel 2, eval, output;
set sel 3, eval, output;
set sel 4, eval, output;
set sel 5, eval, output;
set sel 6, eval, output;
set sel 7, eval, output;

set a %B0001001000110100, set b %B0010001101000101, set c %B0011010001010110, set d %B0100010101100111, set e %B0101011001111000, set f %B0110011110001001, set g %B0111100010011010, set h %B1000100110101011, set sel 0, eval, output;
set sel 1, eval, output;
set sel 2, eval, output;
set sel 3, eval, output;
set sel 4, eval, output;
set sel 5, eval, output;
set sel 6, eval, output;
set sel 7, eval, output;`;

const hdl$g = `/**
 * 4-way demultiplexor.
 * {a,b,c,d} = {in,0,0,0} if sel==00
 *             {0,in,0,0} if sel==01
 *             {0,0,in,0} if sel==10
 *             {0,0,0,in} if sel==11
 */

CHIP DMux4Way {
    IN in, sel[2];
    OUT a, b, c, d;

    PARTS:
}`;
const tst$g = `output-list in%B2.1.2 sel%B2.2.2 a%B2.1.2 b%B2.1.2 c%B2.1.2 d%B2.1.2;

set in 0, set sel %B00, eval, output;
set sel %B01, eval, output;
set sel %B10, eval, output;
set sel %B11, eval, output;

set in 1, set sel %B00, eval, output;
set sel %B01, eval, output;
set sel %B10, eval, output;
set sel %B11, eval, output;`;
const cmp$g = `| in  | sel  |  a  |  b  |  c  |  d  |
|  0  |  00  |  0  |  0  |  0  |  0  |
|  0  |  01  |  0  |  0  |  0  |  0  |
|  0  |  10  |  0  |  0  |  0  |  0  |
|  0  |  11  |  0  |  0  |  0  |  0  |
|  1  |  00  |  1  |  0  |  0  |  0  |
|  1  |  01  |  0  |  1  |  0  |  0  |
|  1  |  10  |  0  |  0  |  1  |  0  |
|  1  |  11  |  0  |  0  |  0  |  1  |`;

const hdl$f = `/**
 * 8-way demultiplexor.
 * {a,b,c,d,e,f,g,h} = {in,0,0,0,0,0,0,0} if sel==000
 *                     {0,in,0,0,0,0,0,0} if sel==001
 *                     etc.
 *                     {0,0,0,0,0,0,0,in} if sel==111
 */


CHIP DMux8Way {
    IN in, sel[3];
    OUT a, b, c, d, e, f, g, h;

    PARTS:
}`;
const tst$f = `output-list in%B2.1.2 sel%B2.2.2 a%B2.1.2 b%B2.1.2 c%B2.1.2 d%B2.1.2 e%B2.1.2 f%B2.1.2 g%B2.1.2 h%B2.1.2;

set in 0, set sel %B000, eval, output;
set sel %B001, eval, output;
set sel %B010, eval, output;
set sel %B011, eval, output;
set sel %B100, eval, output;
set sel %B101, eval, output;
set sel %B110, eval, output;
set sel %B111, eval, output;

set in 1, set sel %B000, eval, output;
set sel %B001, eval, output;
set sel %B010, eval, output;
set sel %B011, eval, output;
set sel %B100, eval, output;
set sel %B101, eval, output;
set sel %B110, eval, output;
set sel %B111, eval, output;`;
const cmp$f = `| in  | sel  |  a  |  b  |  c  |  d  |  e  |  f  |  g  |  h  |
|  0  |  00  |  0  |  0  |  0  |  0  |  0  |  0  |  0  |  0  |
|  0  |  01  |  0  |  0  |  0  |  0  |  0  |  0  |  0  |  0  |
|  0  |  10  |  0  |  0  |  0  |  0  |  0  |  0  |  0  |  0  |
|  0  |  11  |  0  |  0  |  0  |  0  |  0  |  0  |  0  |  0  |
|  0  |  00  |  0  |  0  |  0  |  0  |  0  |  0  |  0  |  0  |
|  0  |  01  |  0  |  0  |  0  |  0  |  0  |  0  |  0  |  0  |
|  0  |  10  |  0  |  0  |  0  |  0  |  0  |  0  |  0  |  0  |
|  0  |  11  |  0  |  0  |  0  |  0  |  0  |  0  |  0  |  0  |
|  1  |  00  |  1  |  0  |  0  |  0  |  0  |  0  |  0  |  0  |
|  1  |  01  |  0  |  1  |  0  |  0  |  0  |  0  |  0  |  0  |
|  1  |  10  |  0  |  0  |  1  |  0  |  0  |  0  |  0  |  0  |
|  1  |  11  |  0  |  0  |  0  |  1  |  0  |  0  |  0  |  0  |
|  1  |  00  |  0  |  0  |  0  |  0  |  1  |  0  |  0  |  0  |
|  1  |  01  |  0  |  0  |  0  |  0  |  0  |  1  |  0  |  0  |
|  1  |  10  |  0  |  0  |  0  |  0  |  0  |  0  |  1  |  0  |
|  1  |  11  |  0  |  0  |  0  |  0  |  0  |  0  |  0  |  1  |`;

const cmp$e = `|     in     | out |
|  00000000  |  0  |
|  11111111  |  1  |
|  00010000  |  1  |
|  00000001  |  1  |
|  00100110  |  1  |`;
const hdl$e = `/**
 * 8-way or gate: out = in[0] or in[1] or ... or in[7].
 */

CHIP Or8Way {
    IN in[8];
    OUT out;

    PARTS:
}`;
const tst$e = `output-list in%B2.8.2 out%B2.1.2;

set in %B00000000, eval, output;
set in %B11111111, eval, output;
set in %B00010000, eval, output;
set in %B00000001, eval, output;
set in %B00100110, eval, output;`;

async function resetFiles$3(fs) {
    await fs.pushd("/projects/01");
    await reset(fs, {
        Not: {
            "Not.hdl": hdl$s,
            "Not.tst": tst$s,
            "Not.cmp": cmp$s,
        },
        And: {
            "And.hdl": hdl$r,
            "And.tst": tst$r,
            "And.cmp": cmp$r,
        },
        Or: {
            "Or.hdl": hdl$q,
            "Or.tst": tst$q,
            "Or.cmp": cmp$q,
        },
        XOr: {
            "XOr.hdl": hdl$p,
            "XOr.tst": tst$p,
            "XOr.cmp": cmp$p,
        },
        Mux: {
            "Mux.hdl": hdl$o,
            "Mux.tst": tst$o,
            "Mux.cmp": cmp$o,
        },
        DMux: {
            "DMux.hdl": hdl$n,
            "DMux.tst": tst$n,
            "DMux.cmp": cmp$n,
        },
        Not16: {
            "Not16.hdl": hdl$m,
            "Not16.tst": tst$m,
            "Not16.cmp": cmp$m,
        },
        And16: {
            "And16.hdl": hdl$l,
            "And16.tst": tst$l,
            "And16.cmp": cmp$l,
        },
        Or16: {
            "Or16.hdl": hdl$k,
            "Or16.tst": tst$k,
            "Or16.cmp": cmp$k,
        },
        Mux16: {
            "Mux16.hdl": hdl$j,
            "Mux16.tst": tst$j,
            "Mux16.cmp": cmp$j,
        },
        Mux4way16: {
            "Mux4way16.hdl": hdl$i,
            "Mux4way16.tst": tst$i,
            "Mux4way16.cmp": cmp$i,
        },
        Mux8way16: {
            "Mux8way16.hdl": hdl$h,
            "Mux8way16.tst": tst$h,
            "Mux8way16.cmp": cmp$h,
        },
        DMux4way: {
            "DMux4way.hdl": hdl$g,
            "DMux4way.tst": tst$g,
            "DMux4way.cmp": cmp$g,
        },
        DMux8way: {
            "DMux8way.hdl": hdl$f,
            "DMux8way.tst": tst$f,
            "DMux8way.cmp": cmp$f,
        },
        Or8way: {
            "Or8way.hdl": hdl$e,
            "Or8way.tst": tst$e,
            "Or8way.cmp": cmp$e,
        },
    });
    await fs.popd();
}

const hdl$d = `// Computes the sum of two bits.

CHIP HalfAdder {
   IN a, b;    // 1-bit inputs
   OUT sum,    // Right bit of a + b 
       carry;  // Left bit of a + b

   PARTS:
   // Put you code here:
}`;
const cmp$d = `|   a   |   b   |  sum  | carry |
|   0   |   0   |   0   |   0   |
|   0   |   1   |   1   |   0   |
|   1   |   0   |   1   |   0   |
|   1   |   1   |   0   |   1   |`;
const tst$d = `output-list a%B3.1.3 b%B3.1.3 sum%B3.1.3 carry%B3.1.3;

set a 0,
set b 0,
eval,
output;

set a 0,
set b 1,
eval,
output;

set a 1,
set b 0,
eval,
output;

set a 1,
set b 1,
eval,
output;`;

const hdl$c = `// Computes the sum of three bits.

CHIP FullAdder {
   IN a, b, c;  // 1-bit inputs
   OUT sum,     // Right bit of a + b + c
       carry;   // Left bit of a + b + c

   PARTS:
   // Put you code here:
}`;
const cmp$c = `|   a   |   b   |   c   |  sum  | carry |
|   0   |   0   |   0   |   0   |   0   |
|   0   |   0   |   1   |   1   |   0   |
|   0   |   1   |   0   |   1   |   0   |
|   0   |   1   |   1   |   0   |   1   |
|   1   |   0   |   0   |   1   |   0   |
|   1   |   0   |   1   |   0   |   1   |
|   1   |   1   |   0   |   0   |   1   |
|   1   |   1   |   1   |   1   |   1   |`;
const tst$c = `output-list a%B3.1.3 b%B3.1.3 c%B3.1.3 sum%B3.1.3 carry%B3.1.3;

set a 0,
set b 0,
set c 0,
eval,
output;

set c 1,
eval,
output;

set b 1,
set c 0,
eval,
output;

set c 1,
eval,
output;

set a 1,
set b 0,
set c 0,
eval,
output;

set c 1,
eval,
output;

set b 1,
set c 0,
eval,
output;

set c 1,
eval,
output;`;

const hdl$b = `/**
* Adds two 16-bit values.
* The most significant carry bit is ignored.
*/

CHIP Add16 {
   IN a[16], b[16];
   OUT out[16];

   PARTS:
}`;
const cmp$b = `|        a         |        b         |       out        |
| 0000000000000000 | 0000000000000000 | 0000000000000000 |
| 0000000000000000 | 1111111111111111 | 1111111111111111 |
| 1111111111111111 | 1111111111111111 | 1111111111111110 |
| 1010101010101010 | 0101010101010101 | 1111111111111111 |
| 0011110011000011 | 0000111111110000 | 0100110010110011 |
| 0001001000110100 | 1001100001110110 | 1010101010101010 |`;
const tst$b = `output-list a%B1.16.1 b%B1.16.1 out%B1.16.1;

set a %B0000000000000000,
set b %B0000000000000000,
eval,
output;

set a %B0000000000000000,
set b %B1111111111111111,
eval,
output;

set a %B1111111111111111,
set b %B1111111111111111,
eval,
output;

set a %B1010101010101010,
set b %B0101010101010101,
eval,
output;

set a %B0011110011000011,
set b %B0000111111110000,
eval,
output;

set a %B0001001000110100,
set b %B1001100001110110,
eval,
output;`;

const hdl$a = `/**
* 16-bit incrementer:
* out = in + 1 (arithmetic addition)
*/

CHIP Inc16 {
   IN in[16];
   OUT out[16];

   PARTS:
  // Put you code here:
}`;
const cmp$a = `|        in        |       out        |
| 0000000000000000 | 0000000000000001 |
| 1111111111111111 | 0000000000000000 |
| 0000000000000101 | 0000000000000110 |
| 1111111111111011 | 1111111111111100 |
`;
const tst$a = `output-list in%B1.16.1 out%B1.16.1;

set in %B0000000000000000,  // in = 0
eval,
output;

set in %B1111111111111111,  // in = -1
eval,
output;

set in %B0000000000000101,  // in = 5
eval,
output;

set in %B1111111111111011,  // in = -5
eval,
output;`;

const hdl$9 = `/**
 * The ALU (Arithmetic Logic Unit).
 * Computes one of the following functions:
 * x+y, x-y, y-x, 0, 1, -1, x, y, -x, -y, !x, !y,
 * x+1, y+1, x-1, y-1, x&y, x|y on two 16-bit inputs, 
 * according to 6 input bits denoted zx,nx,zy,ny,f,no.
 * In addition, the ALU computes two 1-bit outputs:
 * if the ALU output == 0, zr is set to 1; otherwise zr is set to 0;
 * if the ALU output < 0, ng is set to 1; otherwise ng is set to 0.
 */

// Implementation: the ALU logic manipulates the x and y inputs
// and operates on the resulting values, as follows:
// if (zx == 1) set x = 0        // 16-bit constant
// if (nx == 1) set x = !x       // bitwise not
// if (zy == 1) set y = 0        // 16-bit constant
// if (ny == 1) set y = !y       // bitwise not
// if (f == 1)  set out = x + y  // integer 2's complement addition
// if (f == 0)  set out = x & y  // bitwise and
// if (no == 1) set out = !out   // bitwise not
// if (out == 0) set zr = 1
// if (out < 0) set ng = 1

CHIP ALU {
    IN  
        x[16], y[16],  // 16-bit inputs        
        zx, // zero the x input?
        nx, // negate the x input?
        zy, // zero the y input?
        ny, // negate the y input?
        f,  // compute out = x + y (if 1) or x & y (if 0)
        no; // negate the out output?

    OUT 
        out[16], // 16-bit output

    PARTS:
   // Put you code here:
}`;
const cmp$9 = `|        x         |        y         |zx |nx |zy |ny | f |no |       out        |
| 0000000000000000 | 1111111111111111 | 1 | 0 | 1 | 0 | 1 | 0 | 0000000000000000 |
| 0000000000000000 | 1111111111111111 | 1 | 1 | 1 | 1 | 1 | 1 | 0000000000000001 |
| 0000000000000000 | 1111111111111111 | 1 | 1 | 1 | 0 | 1 | 0 | 1111111111111111 |
| 0000000000000000 | 1111111111111111 | 0 | 0 | 1 | 1 | 0 | 0 | 0000000000000000 |
| 0000000000000000 | 1111111111111111 | 1 | 1 | 0 | 0 | 0 | 0 | 1111111111111111 |
| 0000000000000000 | 1111111111111111 | 0 | 0 | 1 | 1 | 0 | 1 | 1111111111111111 |
| 0000000000000000 | 1111111111111111 | 1 | 1 | 0 | 0 | 0 | 1 | 0000000000000000 |
| 0000000000000000 | 1111111111111111 | 0 | 0 | 1 | 1 | 1 | 1 | 0000000000000000 |
| 0000000000000000 | 1111111111111111 | 1 | 1 | 0 | 0 | 1 | 1 | 0000000000000001 |
| 0000000000000000 | 1111111111111111 | 0 | 1 | 1 | 1 | 1 | 1 | 0000000000000001 |
| 0000000000000000 | 1111111111111111 | 1 | 1 | 0 | 1 | 1 | 1 | 0000000000000000 |
| 0000000000000000 | 1111111111111111 | 0 | 0 | 1 | 1 | 1 | 0 | 1111111111111111 |
| 0000000000000000 | 1111111111111111 | 1 | 1 | 0 | 0 | 1 | 0 | 1111111111111110 |
| 0000000000000000 | 1111111111111111 | 0 | 0 | 0 | 0 | 1 | 0 | 1111111111111111 |
| 0000000000000000 | 1111111111111111 | 0 | 1 | 0 | 0 | 1 | 1 | 0000000000000001 |
| 0000000000000000 | 1111111111111111 | 0 | 0 | 0 | 1 | 1 | 1 | 1111111111111111 |
| 0000000000000000 | 1111111111111111 | 0 | 0 | 0 | 0 | 0 | 0 | 0000000000000000 |
| 0000000000000000 | 1111111111111111 | 0 | 1 | 0 | 1 | 0 | 1 | 1111111111111111 |
| 0101101110100000 | 0001111011010010 | 1 | 0 | 1 | 0 | 1 | 0 | 0000000000000000 |
| 0101101110100000 | 0001111011010010 | 1 | 1 | 1 | 1 | 1 | 1 | 0000000000000001 |
| 0101101110100000 | 0001111011010010 | 1 | 1 | 1 | 0 | 1 | 0 | 1111111111111111 |
| 0101101110100000 | 0001111011010010 | 0 | 0 | 1 | 1 | 0 | 0 | 0101101110100000 |
| 0101101110100000 | 0001111011010010 | 1 | 1 | 0 | 0 | 0 | 0 | 0001111011010010 |
| 0101101110100000 | 0001111011010010 | 0 | 0 | 1 | 1 | 0 | 1 | 1010010001011111 |
| 0101101110100000 | 0001111011010010 | 1 | 1 | 0 | 0 | 0 | 1 | 1110000100101101 |
| 0101101110100000 | 0001111011010010 | 0 | 0 | 1 | 1 | 1 | 1 | 1010010001100000 |
| 0101101110100000 | 0001111011010010 | 1 | 1 | 0 | 0 | 1 | 1 | 1110000100101110 |
| 0101101110100000 | 0001111011010010 | 0 | 1 | 1 | 1 | 1 | 1 | 0101101110100001 |
| 0101101110100000 | 0001111011010010 | 1 | 1 | 0 | 1 | 1 | 1 | 0001111011010011 |
| 0101101110100000 | 0001111011010010 | 0 | 0 | 1 | 1 | 1 | 0 | 0101101110011111 |
| 0101101110100000 | 0001111011010010 | 1 | 1 | 0 | 0 | 1 | 0 | 0001111011010001 |
| 0101101110100000 | 0001111011010010 | 0 | 0 | 0 | 0 | 1 | 0 | 0111101001110010 |
| 0101101110100000 | 0001111011010010 | 0 | 1 | 0 | 0 | 1 | 1 | 0011110011001110 |
| 0101101110100000 | 0001111011010010 | 0 | 0 | 0 | 1 | 1 | 1 | 1100001100110010 |
| 0101101110100000 | 0001111011010010 | 0 | 0 | 0 | 0 | 0 | 0 | 0001101010000000 |
| 0101101110100000 | 0001111011010010 | 0 | 1 | 0 | 1 | 0 | 1 | 0101111111110010 |
`;
const tst$9 = `
// ALU no stat tst provides a partial test of the ALU chip.
// It IS NOT a replacement for ALU.tst.

// ALU-nostat.tst tests only the computation part of the ALU.
// The 'zr' and 'ng' status outputs are ignored.

// This test lets you concentrate on getting the ALU computation right without the
// additional task of handling the status outputs.

// Once your ALU passes ALU-nostat.tst you need to test it with ALU.tst.
// This way, any comparison failures during ALU.tst will be caused by errors in
// the handling of the 'zr' and 'ng' status outputs.

output-list x%B1.16.1 y%B1.16.1 zx%B1.1.1 nx%B1.1.1 zy%B1.1.1 
            ny%B1.1.1 f%B1.1.1 no%B1.1.1 out%B1.16.1;

set x %B0000000000000000,
set y %B1111111111111111,

set zx 1,
set nx 0,
set zy 1,
set ny 0,
set f  1,
set no 0,
eval,
output;

set zx 1,
set nx 1,
set zy 1,
set ny 1,
set f  1,
set no 1,
eval,
output;

set zx 1,
set nx 1,
set zy 1,
set ny 0,
set f  1,
set no 0,
eval,
output;

set zx 0,
set nx 0,
set zy 1,
set ny 1,
set f  0,
set no 0,
eval,
output;

set zx 1,
set nx 1,
set zy 0,
set ny 0,
set f  0,
set no 0,
eval,
output;

set zx 0,
set nx 0,
set zy 1,
set ny 1,
set f  0,
set no 1,
eval,
output;

set zx 1,
set nx 1,
set zy 0,
set ny 0,
set f  0,
set no 1,
eval,
output;

set zx 0,
set nx 0,
set zy 1,
set ny 1,
set f  1,
set no 1,
eval,
output;

set zx 1,
set nx 1,
set zy 0,
set ny 0,
set f  1,
set no 1,
eval,
output;

set zx 0,
set nx 1,
set zy 1,
set ny 1,
set f  1,
set no 1,
eval,
output;

set zx 1,
set nx 1,
set zy 0,
set ny 1,
set f  1,
set no 1,
eval,
output;

set zx 0,
set nx 0,
set zy 1,
set ny 1,
set f  1,
set no 0,
eval,
output;

set zx 1,
set nx 1,
set zy 0,
set ny 0,
set f  1,
set no 0,
eval,
output;

set zx 0,
set nx 0,
set zy 0,
set ny 0,
set f  1,
set no 0,
eval,
output;

set zx 0,
set nx 1,
set zy 0,
set ny 0,
set f  1,
set no 1,
eval,
output;

set zx 0,
set nx 0,
set zy 0,
set ny 1,
set f  1,
set no 1,
eval,
output;

set zx 0,
set nx 0,
set zy 0,
set ny 0,
set f  0,
set no 0,
eval,
output;

set zx 0,
set nx 1,
set zy 0,
set ny 1,
set f  0,
set no 1,
eval,
output;

set x %B101101110100000,
set y %B001111011010010,

set zx 1,
set nx 0,
set zy 1,
set ny 0,
set f  1,
set no 0,
eval,
output;

set zx 1,
set nx 1,
set zy 1,
set ny 1,
set f  1,
set no 1,
eval,
output;

set zx 1,
set nx 1,
set zy 1,
set ny 0,
set f  1,
set no 0,
eval,
output;

set zx 0,
set nx 0,
set zy 1,
set ny 1,
set f  0,
set no 0,
eval,
output;

set zx 1,
set nx 1,
set zy 0,
set ny 0,
set f  0,
set no 0,
eval,
output;

set zx 0,
set nx 0,
set zy 1,
set ny 1,
set f  0,
set no 1,
eval,
output;

set zx 1,
set nx 1,
set zy 0,
set ny 0,
set f  0,
set no 1,
eval,
output;

set zx 0,
set nx 0,
set zy 1,
set ny 1,
set f  1,
set no 1,
eval,
output;

set zx 1,
set nx 1,
set zy 0,
set ny 0,
set f  1,
set no 1,
eval,
output;

set zx 0,
set nx 1,
set zy 1,
set ny 1,
set f  1,
set no 1,
eval,
output;

set zx 1,
set nx 1,
set zy 0,
set ny 1,
set f  1,
set no 1,
eval,
output;

set zx 0,
set nx 0,
set zy 1,
set ny 1,
set f  1,
set no 0,
eval,
output;

set zx 1,
set nx 1,
set zy 0,
set ny 0,
set f  1,
set no 0,
eval,
output;

set zx 0,
set nx 0,
set zy 0,
set ny 0,
set f  1,
set no 0,
eval,
output;

set zx 0,
set nx 1,
set zy 0,
set ny 0,
set f  1,
set no 1,
eval,
output;

set zx 0,
set nx 0,
set zy 0,
set ny 1,
set f  1,
set no 1,
eval,
output;

set zx 0,
set nx 0,
set zy 0,
set ny 0,
set f  0,
set no 0,
eval,
output;

set zx 0,
set nx 1,
set zy 0,
set ny 1,
set f  0,
set no 1,
eval,
output;`;

const hdl$8 = `/**
 * The ALU (Arithmetic Logic Unit).
 * Computes one of the following functions:
 * x+y, x-y, y-x, 0, 1, -1, x, y, -x, -y, !x, !y,
 * x+1, y+1, x-1, y-1, x&y, x|y on two 16-bit inputs, 
 * according to 6 input bits denoted zx,nx,zy,ny,f,no.
 * In addition, the ALU computes two 1-bit outputs:
 * if the ALU output == 0, zr is set to 1; otherwise zr is set to 0;
 * if the ALU output < 0, ng is set to 1; otherwise ng is set to 0.
 */

// Implementation: the ALU logic manipulates the x and y inputs
// and operates on the resulting values, as follows:
// if (zx == 1) set x = 0        // 16-bit constant
// if (nx == 1) set x = !x       // bitwise not
// if (zy == 1) set y = 0        // 16-bit constant
// if (ny == 1) set y = !y       // bitwise not
// if (f == 1)  set out = x + y  // integer 2's complement addition
// if (f == 0)  set out = x & y  // bitwise and
// if (no == 1) set out = !out   // bitwise not
// if (out == 0) set zr = 1
// if (out < 0) set ng = 1

CHIP ALU {
    IN  
        x[16], y[16],  // 16-bit inputs        
        zx, // zero the x input?
        nx, // negate the x input?
        zy, // zero the y input?
        ny, // negate the y input?
        f,  // compute out = x + y (if 1) or x & y (if 0)
        no; // negate the out output?

    OUT 
        out[16], // 16-bit output
        zr, // 1 if (out == 0), 0 otherwise
        ng; // 1 if (out < 0),  0 otherwise

    PARTS:
   // Put you code here:
}`;
const cmp$8 = `|        x         |        y         |zx |nx |zy |ny | f |no |       out        |zr |ng |
| 0000000000000000 | 1111111111111111 | 1 | 0 | 1 | 0 | 1 | 0 | 0000000000000000 | 1 | 0 |
| 0000000000000000 | 1111111111111111 | 1 | 1 | 1 | 1 | 1 | 1 | 0000000000000001 | 0 | 0 |
| 0000000000000000 | 1111111111111111 | 1 | 1 | 1 | 0 | 1 | 0 | 1111111111111111 | 0 | 1 |
| 0000000000000000 | 1111111111111111 | 0 | 0 | 1 | 1 | 0 | 0 | 0000000000000000 | 1 | 0 |
| 0000000000000000 | 1111111111111111 | 1 | 1 | 0 | 0 | 0 | 0 | 1111111111111111 | 0 | 1 |
| 0000000000000000 | 1111111111111111 | 0 | 0 | 1 | 1 | 0 | 1 | 1111111111111111 | 0 | 1 |
| 0000000000000000 | 1111111111111111 | 1 | 1 | 0 | 0 | 0 | 1 | 0000000000000000 | 1 | 0 |
| 0000000000000000 | 1111111111111111 | 0 | 0 | 1 | 1 | 1 | 1 | 0000000000000000 | 1 | 0 |
| 0000000000000000 | 1111111111111111 | 1 | 1 | 0 | 0 | 1 | 1 | 0000000000000001 | 0 | 0 |
| 0000000000000000 | 1111111111111111 | 0 | 1 | 1 | 1 | 1 | 1 | 0000000000000001 | 0 | 0 |
| 0000000000000000 | 1111111111111111 | 1 | 1 | 0 | 1 | 1 | 1 | 0000000000000000 | 1 | 0 |
| 0000000000000000 | 1111111111111111 | 0 | 0 | 1 | 1 | 1 | 0 | 1111111111111111 | 0 | 1 |
| 0000000000000000 | 1111111111111111 | 1 | 1 | 0 | 0 | 1 | 0 | 1111111111111110 | 0 | 1 |
| 0000000000000000 | 1111111111111111 | 0 | 0 | 0 | 0 | 1 | 0 | 1111111111111111 | 0 | 1 |
| 0000000000000000 | 1111111111111111 | 0 | 1 | 0 | 0 | 1 | 1 | 0000000000000001 | 0 | 0 |
| 0000000000000000 | 1111111111111111 | 0 | 0 | 0 | 1 | 1 | 1 | 1111111111111111 | 0 | 1 |
| 0000000000000000 | 1111111111111111 | 0 | 0 | 0 | 0 | 0 | 0 | 0000000000000000 | 1 | 0 |
| 0000000000000000 | 1111111111111111 | 0 | 1 | 0 | 1 | 0 | 1 | 1111111111111111 | 0 | 1 |
| 0000000000010001 | 0000000000000011 | 1 | 0 | 1 | 0 | 1 | 0 | 0000000000000000 | 1 | 0 |
| 0000000000010001 | 0000000000000011 | 1 | 1 | 1 | 1 | 1 | 1 | 0000000000000001 | 0 | 0 |
| 0000000000010001 | 0000000000000011 | 1 | 1 | 1 | 0 | 1 | 0 | 1111111111111111 | 0 | 1 |
| 0000000000010001 | 0000000000000011 | 0 | 0 | 1 | 1 | 0 | 0 | 0000000000010001 | 0 | 0 |
| 0000000000010001 | 0000000000000011 | 1 | 1 | 0 | 0 | 0 | 0 | 0000000000000011 | 0 | 0 |
| 0000000000010001 | 0000000000000011 | 0 | 0 | 1 | 1 | 0 | 1 | 1111111111101110 | 0 | 1 |
| 0000000000010001 | 0000000000000011 | 1 | 1 | 0 | 0 | 0 | 1 | 1111111111111100 | 0 | 1 |
| 0000000000010001 | 0000000000000011 | 0 | 0 | 1 | 1 | 1 | 1 | 1111111111101111 | 0 | 1 |
| 0000000000010001 | 0000000000000011 | 1 | 1 | 0 | 0 | 1 | 1 | 1111111111111101 | 0 | 1 |
| 0000000000010001 | 0000000000000011 | 0 | 1 | 1 | 1 | 1 | 1 | 0000000000010010 | 0 | 0 |
| 0000000000010001 | 0000000000000011 | 1 | 1 | 0 | 1 | 1 | 1 | 0000000000000100 | 0 | 0 |
| 0000000000010001 | 0000000000000011 | 0 | 0 | 1 | 1 | 1 | 0 | 0000000000010000 | 0 | 0 |
| 0000000000010001 | 0000000000000011 | 1 | 1 | 0 | 0 | 1 | 0 | 0000000000000010 | 0 | 0 |
| 0000000000010001 | 0000000000000011 | 0 | 0 | 0 | 0 | 1 | 0 | 0000000000010100 | 0 | 0 |
| 0000000000010001 | 0000000000000011 | 0 | 1 | 0 | 0 | 1 | 1 | 0000000000001110 | 0 | 0 |
| 0000000000010001 | 0000000000000011 | 0 | 0 | 0 | 1 | 1 | 1 | 1111111111110010 | 0 | 1 |
| 0000000000010001 | 0000000000000011 | 0 | 0 | 0 | 0 | 0 | 0 | 0000000000000001 | 0 | 0 |
| 0000000000010001 | 0000000000000011 | 0 | 1 | 0 | 1 | 0 | 1 | 0000000000010011 | 0 | 0 |`;
const tst$8 = `output-list x%B1.16.1 y%B1.16.1 zx%B1.1.1 nx%B1.1.1 zy%B1.1.1 
ny%B1.1.1 f%B1.1.1 no%B1.1.1 out%B1.16.1 zr%B1.1.1
ng%B1.1.1;

set x %B0000000000000000,  // x = 0
set y %B1111111111111111;  // y = -1

// Compute 0
set zx 1,
set nx 0,
set zy 1,
set ny 0,
set f  1,
set no 0,
eval,
output;

// Compute 1
set zx 1,
set nx 1,
set zy 1,
set ny 1,
set f  1,
set no 1,
eval,
output;

// Compute -1
set zx 1,
set nx 1,
set zy 1,
set ny 0,
set f  1,
set no 0,
eval,
output;

// Compute x
set zx 0,
set nx 0,
set zy 1,
set ny 1,
set f  0,
set no 0,
eval,
output;

// Compute y
set zx 1,
set nx 1,
set zy 0,
set ny 0,
set f  0,
set no 0,
eval,
output;

// Compute !x
set zx 0,
set nx 0,
set zy 1,
set ny 1,
set f  0,
set no 1,
eval,
output;

// Compute !y
set zx 1,
set nx 1,
set zy 0,
set ny 0,
set f  0,
set no 1,
eval,
output;

// Compute -x
set zx 0,
set nx 0,
set zy 1,
set ny 1,
set f  1,
set no 1,
eval,
output;

// Compute -y
set zx 1,
set nx 1,
set zy 0,
set ny 0,
set f  1,
set no 1,
eval,
output;

// Compute x + 1
set zx 0,
set nx 1,
set zy 1,
set ny 1,
set f  1,
set no 1,
eval,
output;

// Compute y + 1
set zx 1,
set nx 1,
set zy 0,
set ny 1,
set f  1,
set no 1,
eval,
output;

// Compute x - 1
set zx 0,
set nx 0,
set zy 1,
set ny 1,
set f  1,
set no 0,
eval,
output;

// Compute y - 1
set zx 1,
set nx 1,
set zy 0,
set ny 0,
set f  1,
set no 0,
eval,
output;

// Compute x + y
set zx 0,
set nx 0,
set zy 0,
set ny 0,
set f  1,
set no 0,
eval,
output;

// Compute x - y
set zx 0,
set nx 1,
set zy 0,
set ny 0,
set f  1,
set no 1,
eval,
output;

// Compute y - x
set zx 0,
set nx 0,
set zy 0,
set ny 1,
set f  1,
set no 1,
eval,
output;

// Compute x & y
set zx 0,
set nx 0,
set zy 0,
set ny 0,
set f  0,
set no 0,
eval,
output;

// Compute x | y
set zx 0,
set nx 1,
set zy 0,
set ny 1,
set f  0,
set no 1,
eval,
output;

set x %B000000000010001,  // x = 17
set y %B000000000000011;  // y =  3

// Compute 0
set zx 1,
set nx 0,
set zy 1,
set ny 0,
set f  1,
set no 0,
eval,
output;

// Compute 1
set zx 1,
set nx 1,
set zy 1,
set ny 1,
set f  1,
set no 1,
eval,
output;

// Compute -1
set zx 1,
set nx 1,
set zy 1,
set ny 0,
set f  1,
set no 0,
eval,
output;

// Compute x
set zx 0,
set nx 0,
set zy 1,
set ny 1,
set f  0,
set no 0,
eval,
output;

// Compute y
set zx 1,
set nx 1,
set zy 0,
set ny 0,
set f  0,
set no 0,
eval,
output;

// Compute !x
set zx 0,
set nx 0,
set zy 1,
set ny 1,
set f  0,
set no 1,
eval,
output;

// Compute !y
set zx 1,
set nx 1,
set zy 0,
set ny 0,
set f  0,
set no 1,
eval,
output;

// Compute -x
set zx 0,
set nx 0,
set zy 1,
set ny 1,
set f  1,
set no 1,
eval,
output;

// Compute -y
set zx 1,
set nx 1,
set zy 0,
set ny 0,
set f  1,
set no 1,
eval,
output;

// Compute x + 1
set zx 0,
set nx 1,
set zy 1,
set ny 1,
set f  1,
set no 1,
eval,
output;

// Compute y + 1
set zx 1,
set nx 1,
set zy 0,
set ny 1,
set f  1,
set no 1,
eval,
output;

// Compute x - 1
set zx 0,
set nx 0,
set zy 1,
set ny 1,
set f  1,
set no 0,
eval,
output;

// Compute y - 1
set zx 1,
set nx 1,
set zy 0,
set ny 0,
set f  1,
set no 0,
eval,
output;

// Compute x + y
set zx 0,
set nx 0,
set zy 0,
set ny 0,
set f  1,
set no 0,
eval,
output;

// Compute x - y
set zx 0,
set nx 1,
set zy 0,
set ny 0,
set f  1,
set no 1,
eval,
output;

// Compute y - x
set zx 0,
set nx 0,
set zy 0,
set ny 1,
set f  1,
set no 1,
eval,
output;

// Compute x & y
set zx 0,
set nx 0,
set zy 0,
set ny 0,
set f  0,
set no 0,
eval,
output;

// Compute x | y
set zx 0,
set nx 1,
set zy 0,
set ny 1,
set f  0,
set no 1,
eval,
output;`;

async function resetFiles$2(fs) {
    await fs.pushd("/projects/02");
    await reset(fs, {
        HalfAdder: {
            "HalfAdder.hdl": hdl$d,
            "HalfAdder.tst": tst$d,
            "HalfAdder.cmp": cmp$d,
        },
        FullAdder: {
            "FullAdder.hdl": hdl$c,
            "FullAdder.tst": tst$c,
            "FullAdder.cmp": cmp$c,
        },
        Add16: {
            "Add16.hdl": hdl$b,
            "Add16.tst": tst$b,
            "Add16.cmp": cmp$b,
        },
        Inc16: {
            "Inc16.hdl": hdl$a,
            "Inc16.tst": tst$a,
            "Inc16.cmp": cmp$a,
        },
        AluNoStat: {
            "AluNoStat.hdl": hdl$9,
            "AluNoStat.tst": tst$9,
            "AluNoStat.cmp": cmp$9,
        },
        ALU: {
            "ALU.hdl": hdl$8,
            "ALU.tst": tst$8,
            "ALU.cmp": cmp$8,
        },
    });
    await fs.popd();
}

const hdl$7 = `/**
 * 1-bit register:
 * If load[t] == 1 then out[t+1] = in[t]
 *                 else out does not change (out[t+1] = out[t])
 */

CHIP Bit {
    IN in, load;
    OUT out;

    PARTS:
}`;
const tst$7 = `output-list time%S1.4.1 in%B2.1.2 load%B2.1.2 out%B2.1.2;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 1, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 1, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 0, set load 1, tick, output; tock, output;
set in 1, set load 1, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 1, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;
set in 1, set load 0, tick, output; tock, output;`;
const cmp$7 = `| time | in  |load | out |
| 0+   |  0  |  0  |  0  |
| 1    |  0  |  0  |  0  |
| 1+   |  0  |  1  |  0  |
| 2    |  0  |  1  |  0  |
| 2+   |  1  |  0  |  0  |
| 3    |  1  |  0  |  0  |
| 3+   |  1  |  1  |  0  |
| 4    |  1  |  1  |  1  |
| 4+   |  0  |  0  |  1  |
| 5    |  0  |  0  |  1  |
| 5+   |  1  |  0  |  1  |
| 6    |  1  |  0  |  1  |
| 6+   |  0  |  1  |  1  |
| 7    |  0  |  1  |  0  |
| 7+   |  1  |  1  |  0  |
| 8    |  1  |  1  |  1  |
| 8+   |  0  |  0  |  1  |
| 9    |  0  |  0  |  1  |
| 9+   |  0  |  0  |  1  |
| 10   |  0  |  0  |  1  |
| 10+  |  0  |  0  |  1  |
| 11   |  0  |  0  |  1  |
| 11+  |  0  |  0  |  1  |
| 12   |  0  |  0  |  1  |
| 12+  |  0  |  0  |  1  |
| 13   |  0  |  0  |  1  |
| 13+  |  0  |  0  |  1  |
| 14   |  0  |  0  |  1  |
| 14+  |  0  |  0  |  1  |
| 15   |  0  |  0  |  1  |
| 15+  |  0  |  0  |  1  |
| 16   |  0  |  0  |  1  |
| 16+  |  0  |  0  |  1  |
| 17   |  0  |  0  |  1  |
| 17+  |  0  |  0  |  1  |
| 18   |  0  |  0  |  1  |
| 18+  |  0  |  0  |  1  |
| 19   |  0  |  0  |  1  |
| 19+  |  0  |  0  |  1  |
| 20   |  0  |  0  |  1  |
| 20+  |  0  |  0  |  1  |
| 21   |  0  |  0  |  1  |
| 21+  |  0  |  0  |  1  |
| 22   |  0  |  0  |  1  |
| 22+  |  0  |  0  |  1  |
| 23   |  0  |  0  |  1  |
| 23+  |  0  |  0  |  1  |
| 24   |  0  |  0  |  1  |
| 24+  |  0  |  0  |  1  |
| 25   |  0  |  0  |  1  |
| 25+  |  0  |  0  |  1  |
| 26   |  0  |  0  |  1  |
| 26+  |  0  |  0  |  1  |
| 27   |  0  |  0  |  1  |
| 27+  |  0  |  0  |  1  |
| 28   |  0  |  0  |  1  |
| 28+  |  0  |  0  |  1  |
| 29   |  0  |  0  |  1  |
| 29+  |  0  |  0  |  1  |
| 30   |  0  |  0  |  1  |
| 30+  |  0  |  0  |  1  |
| 31   |  0  |  0  |  1  |
| 31+  |  0  |  0  |  1  |
| 32   |  0  |  0  |  1  |
| 32+  |  0  |  0  |  1  |
| 33   |  0  |  0  |  1  |
| 33+  |  0  |  0  |  1  |
| 34   |  0  |  0  |  1  |
| 34+  |  0  |  0  |  1  |
| 35   |  0  |  0  |  1  |
| 35+  |  0  |  0  |  1  |
| 36   |  0  |  0  |  1  |
| 36+  |  0  |  0  |  1  |
| 37   |  0  |  0  |  1  |
| 37+  |  0  |  0  |  1  |
| 38   |  0  |  0  |  1  |
| 38+  |  0  |  0  |  1  |
| 39   |  0  |  0  |  1  |
| 39+  |  0  |  0  |  1  |
| 40   |  0  |  0  |  1  |
| 40+  |  0  |  0  |  1  |
| 41   |  0  |  0  |  1  |
| 41+  |  0  |  0  |  1  |
| 42   |  0  |  0  |  1  |
| 42+  |  0  |  0  |  1  |
| 43   |  0  |  0  |  1  |
| 43+  |  0  |  0  |  1  |
| 44   |  0  |  0  |  1  |
| 44+  |  0  |  0  |  1  |
| 45   |  0  |  0  |  1  |
| 45+  |  0  |  0  |  1  |
| 46   |  0  |  0  |  1  |
| 46+  |  0  |  0  |  1  |
| 47   |  0  |  0  |  1  |
| 47+  |  0  |  0  |  1  |
| 48   |  0  |  0  |  1  |
| 48+  |  0  |  0  |  1  |
| 49   |  0  |  0  |  1  |
| 49+  |  0  |  0  |  1  |
| 50   |  0  |  0  |  1  |
| 50+  |  0  |  0  |  1  |
| 51   |  0  |  0  |  1  |
| 51+  |  0  |  0  |  1  |
| 52   |  0  |  0  |  1  |
| 52+  |  0  |  0  |  1  |
| 53   |  0  |  0  |  1  |
| 53+  |  0  |  0  |  1  |
| 54   |  0  |  0  |  1  |
| 54+  |  0  |  0  |  1  |
| 55   |  0  |  0  |  1  |
| 55+  |  0  |  0  |  1  |
| 56   |  0  |  0  |  1  |
| 56+  |  0  |  0  |  1  |
| 57   |  0  |  0  |  1  |
| 57+  |  0  |  1  |  1  |
| 58   |  0  |  1  |  0  |
| 58+  |  1  |  0  |  0  |
| 59   |  1  |  0  |  0  |
| 59+  |  1  |  0  |  0  |
| 60   |  1  |  0  |  0  |
| 60+  |  1  |  0  |  0  |
| 61   |  1  |  0  |  0  |
| 61+  |  1  |  0  |  0  |
| 62   |  1  |  0  |  0  |
| 62+  |  1  |  0  |  0  |
| 63   |  1  |  0  |  0  |
| 63+  |  1  |  0  |  0  |
| 64   |  1  |  0  |  0  |
| 64+  |  1  |  0  |  0  |
| 65   |  1  |  0  |  0  |
| 65+  |  1  |  0  |  0  |
| 66   |  1  |  0  |  0  |
| 66+  |  1  |  0  |  0  |
| 67   |  1  |  0  |  0  |
| 67+  |  1  |  0  |  0  |
| 68   |  1  |  0  |  0  |
| 68+  |  1  |  0  |  0  |
| 69   |  1  |  0  |  0  |
| 69+  |  1  |  0  |  0  |
| 70   |  1  |  0  |  0  |
| 70+  |  1  |  0  |  0  |
| 71   |  1  |  0  |  0  |
| 71+  |  1  |  0  |  0  |
| 72   |  1  |  0  |  0  |
| 72+  |  1  |  0  |  0  |
| 73   |  1  |  0  |  0  |
| 73+  |  1  |  0  |  0  |
| 74   |  1  |  0  |  0  |
| 74+  |  1  |  0  |  0  |
| 75   |  1  |  0  |  0  |
| 75+  |  1  |  0  |  0  |
| 76   |  1  |  0  |  0  |
| 76+  |  1  |  0  |  0  |
| 77   |  1  |  0  |  0  |
| 77+  |  1  |  0  |  0  |
| 78   |  1  |  0  |  0  |
| 78+  |  1  |  0  |  0  |
| 79   |  1  |  0  |  0  |
| 79+  |  1  |  0  |  0  |
| 80   |  1  |  0  |  0  |
| 80+  |  1  |  0  |  0  |
| 81   |  1  |  0  |  0  |
| 81+  |  1  |  0  |  0  |
| 82   |  1  |  0  |  0  |
| 82+  |  1  |  0  |  0  |
| 83   |  1  |  0  |  0  |
| 83+  |  1  |  0  |  0  |
| 84   |  1  |  0  |  0  |
| 84+  |  1  |  0  |  0  |
| 85   |  1  |  0  |  0  |
| 85+  |  1  |  0  |  0  |
| 86   |  1  |  0  |  0  |
| 86+  |  1  |  0  |  0  |
| 87   |  1  |  0  |  0  |
| 87+  |  1  |  0  |  0  |
| 88   |  1  |  0  |  0  |
| 88+  |  1  |  0  |  0  |
| 89   |  1  |  0  |  0  |
| 89+  |  1  |  0  |  0  |
| 90   |  1  |  0  |  0  |
| 90+  |  1  |  0  |  0  |
| 91   |  1  |  0  |  0  |
| 91+  |  1  |  0  |  0  |
| 92   |  1  |  0  |  0  |
| 92+  |  1  |  0  |  0  |
| 93   |  1  |  0  |  0  |
| 93+  |  1  |  0  |  0  |
| 94   |  1  |  0  |  0  |
| 94+  |  1  |  0  |  0  |
| 95   |  1  |  0  |  0  |
| 95+  |  1  |  0  |  0  |
| 96   |  1  |  0  |  0  |
| 96+  |  1  |  0  |  0  |
| 97   |  1  |  0  |  0  |
| 97+  |  1  |  0  |  0  |
| 98   |  1  |  0  |  0  |
| 98+  |  1  |  0  |  0  |
| 99   |  1  |  0  |  0  |
| 99+  |  1  |  0  |  0  |
| 100  |  1  |  0  |  0  |
| 100+ |  1  |  0  |  0  |
| 101  |  1  |  0  |  0  |
| 101+ |  1  |  0  |  0  |
| 102  |  1  |  0  |  0  |
| 102+ |  1  |  0  |  0  |
| 103  |  1  |  0  |  0  |
| 103+ |  1  |  0  |  0  |
| 104  |  1  |  0  |  0  |
| 104+ |  1  |  0  |  0  |
| 105  |  1  |  0  |  0  |
| 105+ |  1  |  0  |  0  |
| 106  |  1  |  0  |  0  |
| 106+ |  1  |  0  |  0  |
| 107  |  1  |  0  |  0  |`;

const hdl$6 = `/**
 * 16-bit register:
 * If load[t] == 1 then out[t+1] = in[t]
 * else out does not change
 */

CHIP Register {
    IN in[16], load;
    OUT out[16];

    PARTS:
}`;
const tst$6 = `output-list time%S1.4.1 in%D1.6.1 load%B2.1.2 out%D1.6.1;\n` +
    [
        [0, 0],
        [0, 1],
        [-32123, 0],
        [11111, 0],
        [-32123, 1],
        [-32123, 1],
        [-32123, 0],
        [12345, 1],
        [0, 0],
        [0, 1],
    ]
        .map(([inn, load]) => `set in ${inn}, set load ${load}, tick, output; tock, output;`)
        .join("\n") +
    [
        "%B0000000000000001",
        "%B0000000000000010",
        "%B0000000000000100",
        "%B0000000000001000",
        "%B0000000000010000",
        "%B0000000000100000",
        "%B0000000001000000",
        "%B0000000010000000",
        "%B0000000100000000",
        "%B0000001000000000",
        "%B0000010000000000",
        "%B0000100000000000",
        "%B0001000000000000",
        "%B0010000000000000",
        "%B0100000000000000",
        "%B1000000000000000",
        "%B1111111111111110",
        "%B1111111111111101",
        "%B1111111111111011",
        "%B1111111111110111",
        "%B1111111111101111",
        "%B1111111111011111",
        "%B1111111110111111",
        "%B1111111101111111",
        "%B1111111011111111",
        "%B1111110111111111",
        "%B1111101111111111",
        "%B1111011111111111",
        "%B1110111111111111",
        "%B1101111111111111",
        "%B1011111111111111",
        "%B0111111111111111",
    ].map((n) => `set in ${n}, set load 0, tick, output; tock, output; set load 1, tick, output; tock, output;`);
const cmp$6 = `| time |   in   |load |  out   |
| 0+   |      0 |  0  |      0 |
| 1    |      0 |  0  |      0 |
| 1+   |      0 |  1  |      0 |
| 2    |      0 |  1  |      0 |
| 2+   | -32123 |  0  |      0 |
| 3    | -32123 |  0  |      0 |
| 3+   |  11111 |  0  |      0 |
| 4    |  11111 |  0  |      0 |
| 4+   | -32123 |  1  |      0 |
| 5    | -32123 |  1  | -32123 |
| 5+   | -32123 |  1  | -32123 |
| 6    | -32123 |  1  | -32123 |
| 6+   | -32123 |  0  | -32123 |
| 7    | -32123 |  0  | -32123 |
| 7+   |  12345 |  1  | -32123 |
| 8    |  12345 |  1  |  12345 |
| 8+   |      0 |  0  |  12345 |
| 9    |      0 |  0  |  12345 |
| 9+   |      0 |  1  |  12345 |
| 10   |      0 |  1  |      0 |
| 10+  |      1 |  0  |      0 |
| 11   |      1 |  0  |      0 |
| 11+  |      1 |  1  |      0 |
| 12   |      1 |  1  |      1 |
| 12+  |      2 |  0  |      1 |
| 13   |      2 |  0  |      1 |
| 13+  |      2 |  1  |      1 |
| 14   |      2 |  1  |      2 |
| 14+  |      4 |  0  |      2 |
| 15   |      4 |  0  |      2 |
| 15+  |      4 |  1  |      2 |
| 16   |      4 |  1  |      4 |
| 16+  |      8 |  0  |      4 |
| 17   |      8 |  0  |      4 |
| 17+  |      8 |  1  |      4 |
| 18   |      8 |  1  |      8 |
| 18+  |     16 |  0  |      8 |
| 19   |     16 |  0  |      8 |
| 19+  |     16 |  1  |      8 |
| 20   |     16 |  1  |     16 |
| 20+  |     32 |  0  |     16 |
| 21   |     32 |  0  |     16 |
| 21+  |     32 |  1  |     16 |
| 22   |     32 |  1  |     32 |
| 22+  |     64 |  0  |     32 |
| 23   |     64 |  0  |     32 |
| 23+  |     64 |  1  |     32 |
| 24   |     64 |  1  |     64 |
| 24+  |    128 |  0  |     64 |
| 25   |    128 |  0  |     64 |
| 25+  |    128 |  1  |     64 |
| 26   |    128 |  1  |    128 |
| 26+  |    256 |  0  |    128 |
| 27   |    256 |  0  |    128 |
| 27+  |    256 |  1  |    128 |
| 28   |    256 |  1  |    256 |
| 28+  |    512 |  0  |    256 |
| 29   |    512 |  0  |    256 |
| 29+  |    512 |  1  |    256 |
| 30   |    512 |  1  |    512 |
| 30+  |   1024 |  0  |    512 |
| 31   |   1024 |  0  |    512 |
| 31+  |   1024 |  1  |    512 |
| 32   |   1024 |  1  |   1024 |
| 32+  |   2048 |  0  |   1024 |
| 33   |   2048 |  0  |   1024 |
| 33+  |   2048 |  1  |   1024 |
| 34   |   2048 |  1  |   2048 |
| 34+  |   4096 |  0  |   2048 |
| 35   |   4096 |  0  |   2048 |
| 35+  |   4096 |  1  |   2048 |
| 36   |   4096 |  1  |   4096 |
| 36+  |   8192 |  0  |   4096 |
| 37   |   8192 |  0  |   4096 |
| 37+  |   8192 |  1  |   4096 |
| 38   |   8192 |  1  |   8192 |
| 38+  |  16384 |  0  |   8192 |
| 39   |  16384 |  0  |   8192 |
| 39+  |  16384 |  1  |   8192 |
| 40   |  16384 |  1  |  16384 |
| 40+  | -32768 |  0  |  16384 |
| 41   | -32768 |  0  |  16384 |
| 41+  | -32768 |  1  |  16384 |
| 42   | -32768 |  1  | -32768 |
| 42+  |     -2 |  0  | -32768 |
| 43   |     -2 |  0  | -32768 |
| 43+  |     -2 |  1  | -32768 |
| 44   |     -2 |  1  |     -2 |
| 44+  |     -3 |  0  |     -2 |
| 45   |     -3 |  0  |     -2 |
| 45+  |     -3 |  1  |     -2 |
| 46   |     -3 |  1  |     -3 |
| 46+  |     -5 |  0  |     -3 |
| 47   |     -5 |  0  |     -3 |
| 47+  |     -5 |  1  |     -3 |
| 48   |     -5 |  1  |     -5 |
| 48+  |     -9 |  0  |     -5 |
| 49   |     -9 |  0  |     -5 |
| 49+  |     -9 |  1  |     -5 |
| 50   |     -9 |  1  |     -9 |
| 50+  |    -17 |  0  |     -9 |
| 51   |    -17 |  0  |     -9 |
| 51+  |    -17 |  1  |     -9 |
| 52   |    -17 |  1  |    -17 |
| 52+  |    -33 |  0  |    -17 |
| 53   |    -33 |  0  |    -17 |
| 53+  |    -33 |  1  |    -17 |
| 54   |    -33 |  1  |    -33 |
| 54+  |    -65 |  0  |    -33 |
| 55   |    -65 |  0  |    -33 |
| 55+  |    -65 |  1  |    -33 |
| 56   |    -65 |  1  |    -65 |
| 56+  |   -129 |  0  |    -65 |
| 57   |   -129 |  0  |    -65 |
| 57+  |   -129 |  1  |    -65 |
| 58   |   -129 |  1  |   -129 |
| 58+  |   -257 |  0  |   -129 |
| 59   |   -257 |  0  |   -129 |
| 59+  |   -257 |  1  |   -129 |
| 60   |   -257 |  1  |   -257 |
| 60+  |   -513 |  0  |   -257 |
| 61   |   -513 |  0  |   -257 |
| 61+  |   -513 |  1  |   -257 |
| 62   |   -513 |  1  |   -513 |
| 62+  |  -1025 |  0  |   -513 |
| 63   |  -1025 |  0  |   -513 |
| 63+  |  -1025 |  1  |   -513 |
| 64   |  -1025 |  1  |  -1025 |
| 64+  |  -2049 |  0  |  -1025 |
| 65   |  -2049 |  0  |  -1025 |
| 65+  |  -2049 |  1  |  -1025 |
| 66   |  -2049 |  1  |  -2049 |
| 66+  |  -4097 |  0  |  -2049 |
| 67   |  -4097 |  0  |  -2049 |
| 67+  |  -4097 |  1  |  -2049 |
| 68   |  -4097 |  1  |  -4097 |
| 68+  |  -8193 |  0  |  -4097 |
| 69   |  -8193 |  0  |  -4097 |
| 69+  |  -8193 |  1  |  -4097 |
| 70   |  -8193 |  1  |  -8193 |
| 70+  | -16385 |  0  |  -8193 |
| 71   | -16385 |  0  |  -8193 |
| 71+  | -16385 |  1  |  -8193 |
| 72   | -16385 |  1  | -16385 |
| 72+  |  32767 |  0  | -16385 |
| 73   |  32767 |  0  | -16385 |
| 73+  |  32767 |  1  | -16385 |
| 74   |  32767 |  1  |  32767 |`;

const hdl$5 = `/**
 * A 16-bit counter with load and reset control bits.
 * if      (reset[t] == 1) out[t+1] = 0
 * else if (load[t] == 1)  out[t+1] = in[t]
 * else if (inc[t] == 1)   out[t+1] = out[t] + 1  (integer addition)
 * else                    out[t+1] = out[t]
 */

CHIP PC {
    IN in[16],load,inc,reset;
    OUT out[16];

    PARTS:
}`;
const tst$5 = `output-list time%S1.4.1 in%D1.6.1 reset%B2.1.2 load%B2.1.2 inc%B2.1.2 out%D1.6.1;

set in 0, set reset 0, set load 0, set inc 0, tick, output;
tock, output;

set inc 1, tick, output; tock, output;
set in -32123, tick, output; tock, output;
set load 1, tick, output; tock, output;
set load 0, tick, output; tock, output;
tick, output; tock, output;
set in 12345, set load 1, set inc 0, tick, output; tock, output;
set reset 1, tick, output; tock, output;
set reset 0, set inc 1, tick, output; tock, output;
set reset 1, tick, output; tock, output;
set reset 0, set load 0, tick, output; tock, output;
set reset 1, tick, output; tock, output;
set in 0, set reset 0, set load 1, tick, output; tock, output;
set load 0, set inc 1, tick, output; tock, output;
set in 22222, set reset 1, set inc 0, tick, output; tock, output;`;
const cmp$5 = `| time |   in   |reset|load | inc |  out   |
| 0+   |      0 |  0  |  0  |  0  |      0 |
| 1    |      0 |  0  |  0  |  0  |      0 |
| 1+   |      0 |  0  |  0  |  1  |      0 |
| 2    |      0 |  0  |  0  |  1  |      1 |
| 2+   | -32123 |  0  |  0  |  1  |      1 |
| 3    | -32123 |  0  |  0  |  1  |      2 |
| 3+   | -32123 |  0  |  1  |  1  |      2 |
| 4    | -32123 |  0  |  1  |  1  | -32123 |
| 4+   | -32123 |  0  |  0  |  1  | -32123 |
| 5    | -32123 |  0  |  0  |  1  | -32122 |
| 5+   | -32123 |  0  |  0  |  1  | -32122 |
| 6    | -32123 |  0  |  0  |  1  | -32121 |
| 6+   |  12345 |  0  |  1  |  0  | -32121 |
| 7    |  12345 |  0  |  1  |  0  |  12345 |
| 7+   |  12345 |  1  |  1  |  0  |  12345 |
| 8    |  12345 |  1  |  1  |  0  |      0 |
| 8+   |  12345 |  0  |  1  |  1  |      0 |
| 9    |  12345 |  0  |  1  |  1  |  12345 |
| 9+   |  12345 |  1  |  1  |  1  |  12345 |
| 10   |  12345 |  1  |  1  |  1  |      0 |
| 10+  |  12345 |  0  |  0  |  1  |      0 |
| 11   |  12345 |  0  |  0  |  1  |      1 |
| 11+  |  12345 |  1  |  0  |  1  |      1 |
| 12   |  12345 |  1  |  0  |  1  |      0 |
| 12+  |      0 |  0  |  1  |  1  |      0 |
| 13   |      0 |  0  |  1  |  1  |      0 |
| 13+  |      0 |  0  |  0  |  1  |      0 |
| 14   |      0 |  0  |  0  |  1  |      1 |
| 14+  |  22222 |  1  |  0  |  0  |      1 |
| 15   |  22222 |  1  |  0  |  0  |      0 |`;

const hdl$4 = `/**
 * Memory of 8 registers, each 16 bit-wide. Out holds the value
 * stored at the memory location specified by address. If load==1, then 
 * the in value is loaded into the memory location specified by address 
 * (the loaded value will be emitted to out from the next time step onward).
 */

CHIP RAM8 {
    IN in[16], load, address[3];
    OUT out[16];

    PARTS:
}`;
const tst$4 = `output-list time%S1.4.1 in%D1.6.1 load%B2.1.2 address%D3.1.3 out%D1.6.1;
set in 0, set load 0, set address 0,
tick, output; tock, output;

set load 1, tick, output; tock, output;

set in 11111, set load 0,
tick, output; tock, output;

set load 1, set address 1,
tick, output; tock, output;

set load 0, set address 0,
tick, output; tock, output;

set in 3333, set address 3,
tick, output; tock, output;

set load 1,
tick, output; tock, output;

set load 0,
tick, output; tock, output;

set address 1, eval, output;

set in 7777,
tick, output; tock, output;

set load 1, set address 7,
tick, output; tock, output;

set load 0,
tick, output; tock, output;

set address 3, eval, output;

set address 7, eval, output;

set load 0, set address 0,
tick, output; tock, output;

set address 1, eval, output;
set address 2, eval, output;
set address 3, eval, output;
set address 4, eval, output;
set address 5, eval, output;
set address 6, eval, output;
set address 7, eval, output;

set load 1, set in %B0101010101010101, set address 0, tick, output; tock, output;
set address 1, tick, output, tock, output;
set address 2, tick, output, tock, output;
set address 3, tick, output, tock, output;
set address 4, tick, output, tock, output;
set address 5, tick, output, tock, output;
set address 6, tick, output, tock, output;
set address 7, tick, output, tock, output;

set load 0, set address 0, tick, output; tock, output;
set address 1, eval, output;
set address 2, eval, output;
set address 3, eval, output;
set address 4, eval, output;
set address 5, eval, output;
set address 6, eval, output;
set address 7, eval, output;

set load 1, set address 0, set in %B1010101010101010,
tick, output; tock, output;

set load 0, set address 0, tick, output; tock, output;
set address 1, eval, output;
set address 2, eval, output;
set address 3, eval, output;
set address 4, eval, output;
set address 5, eval, output;
set address 6, eval, output;
set address 7, eval, output;

set load 1, set address 0, set in %B0101010101010101,
tick, output, tock, output;
set address 1, set in %B1010101010101010,
tick, output; tock, output;

set load 0, set address 0, tick, output; tock, output;
set address 1, eval, output; set address 2, eval, output;
set address 3, eval, output;
set address 4, eval, output;
set address 5, eval, output;
set address 6, eval, output;
set address 7, eval, output;

set load 1, set address 1, set in %B0101010101010101,
tick, output, tock, output;
set address 2, set in %B1010101010101010,
tick, output; tock, output;

set load 0, set address 0, tick, output; tock, output;
set address 1, eval, output;
set address 2, eval, output;
set address 3, eval, output;
set address 4, eval, output;
set address 5, eval, output;
set address 6, eval, output;
set address 7, eval, output;

set load 1, set address 2, set in %B0101010101010101,
tick, output, tock, output;
set address 3, set in %B1010101010101010,
tick, output; tock, output;

set load 0, set address 0, tick, output; tock, output;
set address 1, eval, output;
set address 2, eval, output;
set address 3, eval, output;
set address 4, eval, output;
set address 5, eval, output;
set address 6, eval, output;
set address 7, eval, output;

set load 1, set address 3, set in %B0101010101010101, tick, output, tock, output;
set address 4, set in %B1010101010101010, tick, output; tock, output;
set load 0, set address 0, tick, output; tock, output;
set address 1, eval, output;
set address 2, eval, output;
set address 3, eval, output;
set address 4, eval, output;
set address 5, eval, output;
set address 6, eval, output;
set address 7, eval, output;

set load 1, set address 4, set in %B0101010101010101, tick, output, tock, output;
set address 5, set in %B1010101010101010, tick, output; tock, output;

set load 0, set address 0, tick, output; tock, output;
set address 1, eval, output;
set address 2, eval, output;
set address 3, eval, output;
set address 4, eval, output;
set address 5, eval, output;
set address 6, eval, output;
set address 7, eval, output;

set load 1, set address 5, set in %B0101010101010101, tick, output, tock, output;
set address 6, set in %B1010101010101010, tick, output; tock, output;

set load 0, set address 0, tick, output; tock, output;
set address 1, eval, output;
set address 2, eval, output;
set address 3, eval, output;
set address 4, eval, output;
set address 5, eval, output;
set address 6, eval, output;
set address 7, eval, output;

set load 1, set address 6, set in %B0101010101010101, tick, output, tock, output;
set address 7, set in %B1010101010101010, tick, output; tock, output;

set load 0, set address 0, tick, output; tock, output;
set address 1, eval, output;
set address 2, eval, output;
set address 3, eval, output;
set address 4, eval, output;
set address 5, eval, output;
set address 6, eval, output;
set address 7, eval, output;

set load 1, set address 7, set in %B0101010101010101, tick, output, tock, output;
set load 0, set address 0, tick, output; tock, output;
set address 1, eval, output;
set address 2, eval, output;
set address 3, eval, output;
set address 4, eval, output;
set address 5, eval, output;
set address 6, eval, output;
set address 7, eval, output;`;
const cmp$4 = `| time |   in   |load |address|  out   |
| 0+   |      0 |  0  |   0   |      0 |
| 1    |      0 |  0  |   0   |      0 |
| 1+   |      0 |  1  |   0   |      0 |
| 2    |      0 |  1  |   0   |      0 |
| 2+   |  11111 |  0  |   0   |      0 |
| 3    |  11111 |  0  |   0   |      0 |
| 3+   |  11111 |  1  |   1   |      0 |
| 4    |  11111 |  1  |   1   |  11111 |
| 4+   |  11111 |  0  |   0   |      0 |
| 5    |  11111 |  0  |   0   |      0 |
| 5+   |   3333 |  0  |   3   |      0 |
| 6    |   3333 |  0  |   3   |      0 |
| 6+   |   3333 |  1  |   3   |      0 |
| 7    |   3333 |  1  |   3   |   3333 |
| 7+   |   3333 |  0  |   3   |   3333 |
| 8    |   3333 |  0  |   3   |   3333 |
| 8    |   3333 |  0  |   1   |  11111 |
| 8+   |   7777 |  0  |   1   |  11111 |
| 9    |   7777 |  0  |   1   |  11111 |
| 9+   |   7777 |  1  |   7   |      0 |
| 10   |   7777 |  1  |   7   |   7777 |
| 10+  |   7777 |  0  |   7   |   7777 |
| 11   |   7777 |  0  |   7   |   7777 |
| 11   |   7777 |  0  |   3   |   3333 |
| 11   |   7777 |  0  |   7   |   7777 |
| 11+  |   7777 |  0  |   0   |      0 |
| 12   |   7777 |  0  |   0   |      0 |
| 12   |   7777 |  0  |   1   |  11111 |
| 12   |   7777 |  0  |   2   |      0 |
| 12   |   7777 |  0  |   3   |   3333 |
| 12   |   7777 |  0  |   4   |      0 |
| 12   |   7777 |  0  |   5   |      0 |
| 12   |   7777 |  0  |   6   |      0 |
| 12   |   7777 |  0  |   7   |   7777 |
| 12+  |  21845 |  1  |   0   |      0 |
| 13   |  21845 |  1  |   0   |  21845 |
| 13+  |  21845 |  1  |   1   |  11111 |
| 14   |  21845 |  1  |   1   |  21845 |
| 14+  |  21845 |  1  |   2   |      0 |
| 15   |  21845 |  1  |   2   |  21845 |
| 15+  |  21845 |  1  |   3   |   3333 |
| 16   |  21845 |  1  |   3   |  21845 |
| 16+  |  21845 |  1  |   4   |      0 |
| 17   |  21845 |  1  |   4   |  21845 |
| 17+  |  21845 |  1  |   5   |      0 |
| 18   |  21845 |  1  |   5   |  21845 |
| 18+  |  21845 |  1  |   6   |      0 |
| 19   |  21845 |  1  |   6   |  21845 |
| 19+  |  21845 |  1  |   7   |   7777 |
| 20   |  21845 |  1  |   7   |  21845 |
| 20+  |  21845 |  0  |   0   |  21845 |
| 21   |  21845 |  0  |   0   |  21845 |
| 21   |  21845 |  0  |   1   |  21845 |
| 21   |  21845 |  0  |   2   |  21845 |
| 21   |  21845 |  0  |   3   |  21845 |
| 21   |  21845 |  0  |   4   |  21845 |
| 21   |  21845 |  0  |   5   |  21845 |
| 21   |  21845 |  0  |   6   |  21845 |
| 21   |  21845 |  0  |   7   |  21845 |
| 21+  | -21846 |  1  |   0   |  21845 |
| 22   | -21846 |  1  |   0   | -21846 |
| 22+  | -21846 |  0  |   0   | -21846 |
| 23   | -21846 |  0  |   0   | -21846 |
| 23   | -21846 |  0  |   1   |  21845 |
| 23   | -21846 |  0  |   2   |  21845 |
| 23   | -21846 |  0  |   3   |  21845 |
| 23   | -21846 |  0  |   4   |  21845 |
| 23   | -21846 |  0  |   5   |  21845 |
| 23   | -21846 |  0  |   6   |  21845 |
| 23   | -21846 |  0  |   7   |  21845 |
| 23+  |  21845 |  1  |   0   | -21846 |
| 24   |  21845 |  1  |   0   |  21845 |
| 24+  | -21846 |  1  |   1   |  21845 |
| 25   | -21846 |  1  |   1   | -21846 |
| 25+  | -21846 |  0  |   0   |  21845 |
| 26   | -21846 |  0  |   0   |  21845 |
| 26   | -21846 |  0  |   1   | -21846 |
| 26   | -21846 |  0  |   2   |  21845 |
| 26   | -21846 |  0  |   3   |  21845 |
| 26   | -21846 |  0  |   4   |  21845 |
| 26   | -21846 |  0  |   5   |  21845 |
| 26   | -21846 |  0  |   6   |  21845 |
| 26   | -21846 |  0  |   7   |  21845 |
| 26+  |  21845 |  1  |   1   | -21846 |
| 27   |  21845 |  1  |   1   |  21845 |
| 27+  | -21846 |  1  |   2   |  21845 |
| 28   | -21846 |  1  |   2   | -21846 |
| 28+  | -21846 |  0  |   0   |  21845 |
| 29   | -21846 |  0  |   0   |  21845 |
| 29   | -21846 |  0  |   1   |  21845 |
| 29   | -21846 |  0  |   2   | -21846 |
| 29   | -21846 |  0  |   3   |  21845 |
| 29   | -21846 |  0  |   4   |  21845 |
| 29   | -21846 |  0  |   5   |  21845 |
| 29   | -21846 |  0  |   6   |  21845 |
| 29   | -21846 |  0  |   7   |  21845 |
| 29+  |  21845 |  1  |   2   | -21846 |
| 30   |  21845 |  1  |   2   |  21845 |
| 30+  | -21846 |  1  |   3   |  21845 |
| 31   | -21846 |  1  |   3   | -21846 |
| 31+  | -21846 |  0  |   0   |  21845 |
| 32   | -21846 |  0  |   0   |  21845 |
| 32   | -21846 |  0  |   1   |  21845 |
| 32   | -21846 |  0  |   2   |  21845 |
| 32   | -21846 |  0  |   3   | -21846 |
| 32   | -21846 |  0  |   4   |  21845 |
| 32   | -21846 |  0  |   5   |  21845 |
| 32   | -21846 |  0  |   6   |  21845 |
| 32   | -21846 |  0  |   7   |  21845 |
| 32+  |  21845 |  1  |   3   | -21846 |
| 33   |  21845 |  1  |   3   |  21845 |
| 33+  | -21846 |  1  |   4   |  21845 |
| 34   | -21846 |  1  |   4   | -21846 |
| 34+  | -21846 |  0  |   0   |  21845 |
| 35   | -21846 |  0  |   0   |  21845 |
| 35   | -21846 |  0  |   1   |  21845 |
| 35   | -21846 |  0  |   2   |  21845 |
| 35   | -21846 |  0  |   3   |  21845 |
| 35   | -21846 |  0  |   4   | -21846 |
| 35   | -21846 |  0  |   5   |  21845 |
| 35   | -21846 |  0  |   6   |  21845 |
| 35   | -21846 |  0  |   7   |  21845 |
| 35+  |  21845 |  1  |   4   | -21846 |
| 36   |  21845 |  1  |   4   |  21845 |
| 36+  | -21846 |  1  |   5   |  21845 |
| 37   | -21846 |  1  |   5   | -21846 |
| 37+  | -21846 |  0  |   0   |  21845 |
| 38   | -21846 |  0  |   0   |  21845 |
| 38   | -21846 |  0  |   1   |  21845 |
| 38   | -21846 |  0  |   2   |  21845 |
| 38   | -21846 |  0  |   3   |  21845 |
| 38   | -21846 |  0  |   4   |  21845 |
| 38   | -21846 |  0  |   5   | -21846 |
| 38   | -21846 |  0  |   6   |  21845 |
| 38   | -21846 |  0  |   7   |  21845 |
| 38+  |  21845 |  1  |   5   | -21846 |
| 39   |  21845 |  1  |   5   |  21845 |
| 39+  | -21846 |  1  |   6   |  21845 |
| 40   | -21846 |  1  |   6   | -21846 |
| 40+  | -21846 |  0  |   0   |  21845 |
| 41   | -21846 |  0  |   0   |  21845 |
| 41   | -21846 |  0  |   1   |  21845 |
| 41   | -21846 |  0  |   2   |  21845 |
| 41   | -21846 |  0  |   3   |  21845 |
| 41   | -21846 |  0  |   4   |  21845 |
| 41   | -21846 |  0  |   5   |  21845 |
| 41   | -21846 |  0  |   6   | -21846 |
| 41   | -21846 |  0  |   7   |  21845 |
| 41+  |  21845 |  1  |   6   | -21846 |
| 42   |  21845 |  1  |   6   |  21845 |
| 42+  | -21846 |  1  |   7   |  21845 |
| 43   | -21846 |  1  |   7   | -21846 |
| 43+  | -21846 |  0  |   0   |  21845 |
| 44   | -21846 |  0  |   0   |  21845 |
| 44   | -21846 |  0  |   1   |  21845 |
| 44   | -21846 |  0  |   2   |  21845 |
| 44   | -21846 |  0  |   3   |  21845 |
| 44   | -21846 |  0  |   4   |  21845 |
| 44   | -21846 |  0  |   5   |  21845 |
| 44   | -21846 |  0  |   6   |  21845 |
| 44   | -21846 |  0  |   7   | -21846 |
| 44+  |  21845 |  1  |   7   | -21846 |
| 45   |  21845 |  1  |   7   |  21845 |
| 45+  |  21845 |  0  |   0   |  21845 |
| 46   |  21845 |  0  |   0   |  21845 |
| 46   |  21845 |  0  |   1   |  21845 |
| 46   |  21845 |  0  |   2   |  21845 |
| 46   |  21845 |  0  |   3   |  21845 |
| 46   |  21845 |  0  |   4   |  21845 |
| 46   |  21845 |  0  |   5   |  21845 |
| 46   |  21845 |  0  |   6   |  21845 |
| 46   |  21845 |  0  |   7   |  21845 |`;

const hdl$3 = `/**
 * Memory of 64 registers, each 16 bit-wide. Out holds the value
 * stored at the memory location specified by address. If load==1, then 
 * the in value is loaded into the memory location specified by address 
 * (the loaded value will be emitted to out from the next time step onward).
 */

CHIP RAM64 {
    IN in[16], load, address[6];
    OUT out[16];
}`;
const tst$3 = `output-list time%S1.4.1 in%D1.6.1 load%B2.1.2 address%D2.3.2 out%D1.6.1;

set in 0, set load 0, set address 0, tick, output; tock, output;
set load 1, tick, output; tock, output;
set in 1313, set load 0, tick, output; tock, output;
set load 1, set address 13, tick, output; tock, output;
set load 0, set address 0, tick, output; tock, output;
set in 4747, set address 47, tick, output; tock, output;
set load 1, tick, output; tock, output;
set load 0, tick, output; tock, output;
set address 13, eval, output;
set in 6363, tick, output; tock, output;
set load 1, set address 63, tick, output; tock, output;
set load 0, tick, output; tock, output;
set address 47, eval, output;
set address 63, eval, output;

set load 0, set address %B101000, tick, output; tock, output;
set address %B101001, eval, output;
set address %B101010, eval, output;
set address %B101011, eval, output;
set address %B101100, eval, output;
set address %B101101, eval, output;
set address %B101110, eval, output;
set address %B101111, eval, output;

set load 1, set in %B0101010101010101, set address %B101000, tick, output; tock, output;
set address %B101001, tick, output, tock, output;
set address %B101010, tick, output, tock, output;
set address %B101011, tick, output, tock, output;
set address %B101100, tick, output, tock, output;
set address %B101101, tick, output, tock, output;
set address %B101110, tick, output, tock, output;
set address %B101111, tick, output, tock, output;

set load 0, set address %B101000, tick, output; tock, output;
set address %B101001, eval, output;
set address %B101010, eval, output;
set address %B101011, eval, output;
set address %B101100, eval, output;
set address %B101101, eval, output;
set address %B101110, eval, output;
set address %B101111, eval, output;

set load 1, set address %B101000, set in %B1010101010101010, tick, output; tock, output;
set load 0, set address %B101000, tick, output; tock, output;
set address %B101001, eval, output;
set address %B101010, eval, output;
set address %B101011, eval, output;
set address %B101100, eval, output;
set address %B101101, eval, output;
set address %B101110, eval, output;
set address %B101111, eval, output;

set load 1, set address %B101000, set in %B0101010101010101, tick, output, tock, output;
set address %B101001, set in %B1010101010101010, tick, output; tock, output;

set load 0, set address %B101000, tick, output; tock, output;
set address %B101001, eval, output;
set address %B101010, eval, output;
set address %B101011, eval, output;
set address %B101100, eval, output;
set address %B101101, eval, output;
set address %B101110, eval, output;
set address %B101111, eval, output;

set load 1, set address %B101001, set in %B0101010101010101,
tick, output, tock, output;
set address %B101010,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B101000,
tick, output; tock, output;
set address %B101001, eval, output;
set address %B101010, eval, output;
set address %B101011, eval, output;
set address %B101100, eval, output;
set address %B101101, eval, output;
set address %B101110, eval, output;
set address %B101111, eval, output;

set load 1,
set address %B101010,
set in %B0101010101010101,
tick, output, tock, output;
set address %B101011,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B101000,
tick, output; tock, output;
set address %B101001, eval, output;
set address %B101010, eval, output;
set address %B101011, eval, output;
set address %B101100, eval, output;
set address %B101101, eval, output;
set address %B101110, eval, output;
set address %B101111, eval, output;

set load 1,
set address %B101011,
set in %B0101010101010101,
tick, output, tock, output;
set address %B101100,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B101000,
tick, output; tock, output;
set address %B101001, eval, output;
set address %B101010, eval, output;
set address %B101011, eval, output;
set address %B101100, eval, output;
set address %B101101, eval, output;
set address %B101110, eval, output;
set address %B101111, eval, output;

set load 1,
set address %B101100,
set in %B0101010101010101,
tick, output, tock, output;
set address %B101101,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B101000,
tick, output; tock, output;
set address %B101001, eval, output;
set address %B101010, eval, output;
set address %B101011, eval, output;
set address %B101100, eval, output;
set address %B101101, eval, output;
set address %B101110, eval, output;
set address %B101111, eval, output;

set load 1,
set address %B101101,
set in %B0101010101010101,
tick, output, tock, output;
set address %B101110,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B101000,
tick, output; tock, output;
set address %B101001, eval, output;
set address %B101010, eval, output;
set address %B101011, eval, output;
set address %B101100, eval, output;
set address %B101101, eval, output;
set address %B101110, eval, output;
set address %B101111, eval, output;

set load 1,
set address %B101110,
set in %B0101010101010101,
tick, output, tock, output;
set address %B101111,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B101000,
tick, output; tock, output;
set address %B101001, eval, output;
set address %B101010, eval, output;
set address %B101011, eval, output;
set address %B101100, eval, output;
set address %B101101, eval, output;
set address %B101110, eval, output;
set address %B101111, eval, output;

set load 1,
set address %B101111,
set in %B0101010101010101,
tick, output, tock, output;

set load 0,
set address %B101000,
tick, output; tock, output;
set address %B101001, eval, output;
set address %B101010, eval, output;
set address %B101011, eval, output;
set address %B101100, eval, output;
set address %B101101, eval, output;
set address %B101110, eval, output;
set address %B101111, eval, output;


set load 0,
set address %B000101,
tick, output; tock, output;
set address %B001101, eval, output;
set address %B010101, eval, output;
set address %B011101, eval, output;
set address %B100101, eval, output;
set address %B101101, eval, output;
set address %B110101, eval, output;
set address %B111101, eval, output;

set load 1,
set in %B0101010101010101,
set address %B000101,
tick, output; tock, output;
set address %B001101, tick, output, tock, output;
set address %B010101, tick, output, tock, output;
set address %B011101, tick, output, tock, output;
set address %B100101, tick, output, tock, output;
set address %B101101, tick, output, tock, output;
set address %B110101, tick, output, tock, output;
set address %B111101, tick, output, tock, output;

set load 0,
set address %B000101,
tick, output; tock, output;
set address %B001101, eval, output;
set address %B010101, eval, output;
set address %B011101, eval, output;
set address %B100101, eval, output;
set address %B101101, eval, output;
set address %B110101, eval, output;
set address %B111101, eval, output;

set load 1,
set address %B000101,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B000101,
tick, output; tock, output;
set address %B001101, eval, output;
set address %B010101, eval, output;
set address %B011101, eval, output;
set address %B100101, eval, output;
set address %B101101, eval, output;
set address %B110101, eval, output;
set address %B111101, eval, output;

set load 1,
set address %B000101,
set in %B0101010101010101,
tick, output, tock, output;
set address %B001101,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B000101,
tick, output; tock, output;
set address %B001101, eval, output;
set address %B010101, eval, output;
set address %B011101, eval, output;
set address %B100101, eval, output;
set address %B101101, eval, output;
set address %B110101, eval, output;
set address %B111101, eval, output;

set load 1,
set address %B001101,
set in %B0101010101010101,
tick, output, tock, output;
set address %B010101,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B000101,
tick, output; tock, output;
set address %B001101, eval, output;
set address %B010101, eval, output;
set address %B011101, eval, output;
set address %B100101, eval, output;
set address %B101101, eval, output;
set address %B110101, eval, output;
set address %B111101, eval, output;

set load 1,
set address %B010101,
set in %B0101010101010101,
tick, output, tock, output;
set address %B011101,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B000101,
tick, output; tock, output;
set address %B001101, eval, output;
set address %B010101, eval, output;
set address %B011101, eval, output;
set address %B100101, eval, output;
set address %B101101, eval, output;
set address %B110101, eval, output;
set address %B111101, eval, output;

set load 1,
set address %B011101,
set in %B0101010101010101,
tick, output, tock, output;
set address %B100101,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B000101,
tick, output; tock, output;
set address %B001101, eval, output;
set address %B010101, eval, output;
set address %B011101, eval, output;
set address %B100101, eval, output;
set address %B101101, eval, output;
set address %B110101, eval, output;
set address %B111101, eval, output;

set load 1,
set address %B100101,
set in %B0101010101010101,
tick, output, tock, output;
set address %B101101,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B000101,
tick, output; tock, output;
set address %B001101, eval, output;
set address %B010101, eval, output;
set address %B011101, eval, output;
set address %B100101, eval, output;
set address %B101101, eval, output;
set address %B110101, eval, output;
set address %B111101, eval, output;

set load 1,
set address %B101101,
set in %B0101010101010101,
tick, output, tock, output;
set address %B110101,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B000101,
tick, output; tock, output;
set address %B001101, eval, output;
set address %B010101, eval, output;
set address %B011101, eval, output;
set address %B100101, eval, output;
set address %B101101, eval, output;
set address %B110101, eval, output;
set address %B111101, eval, output;

set load 1,
set address %B110101,
set in %B0101010101010101,
tick, output, tock, output;
set address %B111101,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B000101,
tick, output; tock, output;
set address %B001101, eval, output;
set address %B010101, eval, output;
set address %B011101, eval, output;
set address %B100101, eval, output;
set address %B101101, eval, output;
set address %B110101, eval, output;
set address %B111101, eval, output;

set load 1,
set address %B111101,
set in %B0101010101010101,
tick, output, tock, output;

set load 0,
set address %B000101,
tick, output; tock, output;
set address %B001101, eval, output;
set address %B010101, eval, output;
set address %B011101, eval, output;
set address %B100101, eval, output;
set address %B101101, eval, output;
set address %B110101, eval, output;
set address %B111101, eval, output;`;
const cmp$3 = `| time |   in   |load |address|  out   |
| 0+   |      0 |  0  |    0  |      0 |
| 1    |      0 |  0  |    0  |      0 |
| 1+   |      0 |  1  |    0  |      0 |
| 2    |      0 |  1  |    0  |      0 |
| 2+   |   1313 |  0  |    0  |      0 |
| 3    |   1313 |  0  |    0  |      0 |
| 3+   |   1313 |  1  |   13  |      0 |
| 4    |   1313 |  1  |   13  |   1313 |
| 4+   |   1313 |  0  |    0  |      0 |
| 5    |   1313 |  0  |    0  |      0 |
| 5+   |   4747 |  0  |   47  |      0 |
| 6    |   4747 |  0  |   47  |      0 |
| 6+   |   4747 |  1  |   47  |      0 |
| 7    |   4747 |  1  |   47  |   4747 |
| 7+   |   4747 |  0  |   47  |   4747 |
| 8    |   4747 |  0  |   47  |   4747 |
| 8    |   4747 |  0  |   13  |   1313 |
| 8+   |   6363 |  0  |   13  |   1313 |
| 9    |   6363 |  0  |   13  |   1313 |
| 9+   |   6363 |  1  |   63  |      0 |
| 10   |   6363 |  1  |   63  |   6363 |
| 10+  |   6363 |  0  |   63  |   6363 |
| 11   |   6363 |  0  |   63  |   6363 |
| 11   |   6363 |  0  |   47  |   4747 |
| 11   |   6363 |  0  |   63  |   6363 |
| 11+  |   6363 |  0  |   40  |      0 |
| 12   |   6363 |  0  |   40  |      0 |
| 12   |   6363 |  0  |   41  |      0 |
| 12   |   6363 |  0  |   42  |      0 |
| 12   |   6363 |  0  |   43  |      0 |
| 12   |   6363 |  0  |   44  |      0 |
| 12   |   6363 |  0  |   45  |      0 |
| 12   |   6363 |  0  |   46  |      0 |
| 12   |   6363 |  0  |   47  |   4747 |
| 12+  |  21845 |  1  |   40  |      0 |
| 13   |  21845 |  1  |   40  |  21845 |
| 13+  |  21845 |  1  |   41  |      0 |
| 14   |  21845 |  1  |   41  |  21845 |
| 14+  |  21845 |  1  |   42  |      0 |
| 15   |  21845 |  1  |   42  |  21845 |
| 15+  |  21845 |  1  |   43  |      0 |
| 16   |  21845 |  1  |   43  |  21845 |
| 16+  |  21845 |  1  |   44  |      0 |
| 17   |  21845 |  1  |   44  |  21845 |
| 17+  |  21845 |  1  |   45  |      0 |
| 18   |  21845 |  1  |   45  |  21845 |
| 18+  |  21845 |  1  |   46  |      0 |
| 19   |  21845 |  1  |   46  |  21845 |
| 19+  |  21845 |  1  |   47  |   4747 |
| 20   |  21845 |  1  |   47  |  21845 |
| 20+  |  21845 |  0  |   40  |  21845 |
| 21   |  21845 |  0  |   40  |  21845 |
| 21   |  21845 |  0  |   41  |  21845 |
| 21   |  21845 |  0  |   42  |  21845 |
| 21   |  21845 |  0  |   43  |  21845 |
| 21   |  21845 |  0  |   44  |  21845 |
| 21   |  21845 |  0  |   45  |  21845 |
| 21   |  21845 |  0  |   46  |  21845 |
| 21   |  21845 |  0  |   47  |  21845 |
| 21+  | -21846 |  1  |   40  |  21845 |
| 22   | -21846 |  1  |   40  | -21846 |
| 22+  | -21846 |  0  |   40  | -21846 |
| 23   | -21846 |  0  |   40  | -21846 |
| 23   | -21846 |  0  |   41  |  21845 |
| 23   | -21846 |  0  |   42  |  21845 |
| 23   | -21846 |  0  |   43  |  21845 |
| 23   | -21846 |  0  |   44  |  21845 |
| 23   | -21846 |  0  |   45  |  21845 |
| 23   | -21846 |  0  |   46  |  21845 |
| 23   | -21846 |  0  |   47  |  21845 |
| 23+  |  21845 |  1  |   40  | -21846 |
| 24   |  21845 |  1  |   40  |  21845 |
| 24+  | -21846 |  1  |   41  |  21845 |
| 25   | -21846 |  1  |   41  | -21846 |
| 25+  | -21846 |  0  |   40  |  21845 |
| 26   | -21846 |  0  |   40  |  21845 |
| 26   | -21846 |  0  |   41  | -21846 |
| 26   | -21846 |  0  |   42  |  21845 |
| 26   | -21846 |  0  |   43  |  21845 |
| 26   | -21846 |  0  |   44  |  21845 |
| 26   | -21846 |  0  |   45  |  21845 |
| 26   | -21846 |  0  |   46  |  21845 |
| 26   | -21846 |  0  |   47  |  21845 |
| 26+  |  21845 |  1  |   41  | -21846 |
| 27   |  21845 |  1  |   41  |  21845 |
| 27+  | -21846 |  1  |   42  |  21845 |
| 28   | -21846 |  1  |   42  | -21846 |
| 28+  | -21846 |  0  |   40  |  21845 |
| 29   | -21846 |  0  |   40  |  21845 |
| 29   | -21846 |  0  |   41  |  21845 |
| 29   | -21846 |  0  |   42  | -21846 |
| 29   | -21846 |  0  |   43  |  21845 |
| 29   | -21846 |  0  |   44  |  21845 |
| 29   | -21846 |  0  |   45  |  21845 |
| 29   | -21846 |  0  |   46  |  21845 |
| 29   | -21846 |  0  |   47  |  21845 |
| 29+  |  21845 |  1  |   42  | -21846 |
| 30   |  21845 |  1  |   42  |  21845 |
| 30+  | -21846 |  1  |   43  |  21845 |
| 31   | -21846 |  1  |   43  | -21846 |
| 31+  | -21846 |  0  |   40  |  21845 |
| 32   | -21846 |  0  |   40  |  21845 |
| 32   | -21846 |  0  |   41  |  21845 |
| 32   | -21846 |  0  |   42  |  21845 |
| 32   | -21846 |  0  |   43  | -21846 |
| 32   | -21846 |  0  |   44  |  21845 |
| 32   | -21846 |  0  |   45  |  21845 |
| 32   | -21846 |  0  |   46  |  21845 |
| 32   | -21846 |  0  |   47  |  21845 |
| 32+  |  21845 |  1  |   43  | -21846 |
| 33   |  21845 |  1  |   43  |  21845 |
| 33+  | -21846 |  1  |   44  |  21845 |
| 34   | -21846 |  1  |   44  | -21846 |
| 34+  | -21846 |  0  |   40  |  21845 |
| 35   | -21846 |  0  |   40  |  21845 |
| 35   | -21846 |  0  |   41  |  21845 |
| 35   | -21846 |  0  |   42  |  21845 |
| 35   | -21846 |  0  |   43  |  21845 |
| 35   | -21846 |  0  |   44  | -21846 |
| 35   | -21846 |  0  |   45  |  21845 |
| 35   | -21846 |  0  |   46  |  21845 |
| 35   | -21846 |  0  |   47  |  21845 |
| 35+  |  21845 |  1  |   44  | -21846 |
| 36   |  21845 |  1  |   44  |  21845 |
| 36+  | -21846 |  1  |   45  |  21845 |
| 37   | -21846 |  1  |   45  | -21846 |
| 37+  | -21846 |  0  |   40  |  21845 |
| 38   | -21846 |  0  |   40  |  21845 |
| 38   | -21846 |  0  |   41  |  21845 |
| 38   | -21846 |  0  |   42  |  21845 |
| 38   | -21846 |  0  |   43  |  21845 |
| 38   | -21846 |  0  |   44  |  21845 |
| 38   | -21846 |  0  |   45  | -21846 |
| 38   | -21846 |  0  |   46  |  21845 |
| 38   | -21846 |  0  |   47  |  21845 |
| 38+  |  21845 |  1  |   45  | -21846 |
| 39   |  21845 |  1  |   45  |  21845 |
| 39+  | -21846 |  1  |   46  |  21845 |
| 40   | -21846 |  1  |   46  | -21846 |
| 40+  | -21846 |  0  |   40  |  21845 |
| 41   | -21846 |  0  |   40  |  21845 |
| 41   | -21846 |  0  |   41  |  21845 |
| 41   | -21846 |  0  |   42  |  21845 |
| 41   | -21846 |  0  |   43  |  21845 |
| 41   | -21846 |  0  |   44  |  21845 |
| 41   | -21846 |  0  |   45  |  21845 |
| 41   | -21846 |  0  |   46  | -21846 |
| 41   | -21846 |  0  |   47  |  21845 |
| 41+  |  21845 |  1  |   46  | -21846 |
| 42   |  21845 |  1  |   46  |  21845 |
| 42+  | -21846 |  1  |   47  |  21845 |
| 43   | -21846 |  1  |   47  | -21846 |
| 43+  | -21846 |  0  |   40  |  21845 |
| 44   | -21846 |  0  |   40  |  21845 |
| 44   | -21846 |  0  |   41  |  21845 |
| 44   | -21846 |  0  |   42  |  21845 |
| 44   | -21846 |  0  |   43  |  21845 |
| 44   | -21846 |  0  |   44  |  21845 |
| 44   | -21846 |  0  |   45  |  21845 |
| 44   | -21846 |  0  |   46  |  21845 |
| 44   | -21846 |  0  |   47  | -21846 |
| 44+  |  21845 |  1  |   47  | -21846 |
| 45   |  21845 |  1  |   47  |  21845 |
| 45+  |  21845 |  0  |   40  |  21845 |
| 46   |  21845 |  0  |   40  |  21845 |
| 46   |  21845 |  0  |   41  |  21845 |
| 46   |  21845 |  0  |   42  |  21845 |
| 46   |  21845 |  0  |   43  |  21845 |
| 46   |  21845 |  0  |   44  |  21845 |
| 46   |  21845 |  0  |   45  |  21845 |
| 46   |  21845 |  0  |   46  |  21845 |
| 46   |  21845 |  0  |   47  |  21845 |
| 46+  |  21845 |  0  |    5  |      0 |
| 47   |  21845 |  0  |    5  |      0 |
| 47   |  21845 |  0  |   13  |   1313 |
| 47   |  21845 |  0  |   21  |      0 |
| 47   |  21845 |  0  |   29  |      0 |
| 47   |  21845 |  0  |   37  |      0 |
| 47   |  21845 |  0  |   45  |  21845 |
| 47   |  21845 |  0  |   53  |      0 |
| 47   |  21845 |  0  |   61  |      0 |
| 47+  |  21845 |  1  |    5  |      0 |
| 48   |  21845 |  1  |    5  |  21845 |
| 48+  |  21845 |  1  |   13  |   1313 |
| 49   |  21845 |  1  |   13  |  21845 |
| 49+  |  21845 |  1  |   21  |      0 |
| 50   |  21845 |  1  |   21  |  21845 |
| 50+  |  21845 |  1  |   29  |      0 |
| 51   |  21845 |  1  |   29  |  21845 |
| 51+  |  21845 |  1  |   37  |      0 |
| 52   |  21845 |  1  |   37  |  21845 |
| 52+  |  21845 |  1  |   45  |  21845 |
| 53   |  21845 |  1  |   45  |  21845 |
| 53+  |  21845 |  1  |   53  |      0 |
| 54   |  21845 |  1  |   53  |  21845 |
| 54+  |  21845 |  1  |   61  |      0 |
| 55   |  21845 |  1  |   61  |  21845 |
| 55+  |  21845 |  0  |    5  |  21845 |
| 56   |  21845 |  0  |    5  |  21845 |
| 56   |  21845 |  0  |   13  |  21845 |
| 56   |  21845 |  0  |   21  |  21845 |
| 56   |  21845 |  0  |   29  |  21845 |
| 56   |  21845 |  0  |   37  |  21845 |
| 56   |  21845 |  0  |   45  |  21845 |
| 56   |  21845 |  0  |   53  |  21845 |
| 56   |  21845 |  0  |   61  |  21845 |
| 56+  | -21846 |  1  |    5  |  21845 |
| 57   | -21846 |  1  |    5  | -21846 |
| 57+  | -21846 |  0  |    5  | -21846 |
| 58   | -21846 |  0  |    5  | -21846 |
| 58   | -21846 |  0  |   13  |  21845 |
| 58   | -21846 |  0  |   21  |  21845 |
| 58   | -21846 |  0  |   29  |  21845 |
| 58   | -21846 |  0  |   37  |  21845 |
| 58   | -21846 |  0  |   45  |  21845 |
| 58   | -21846 |  0  |   53  |  21845 |
| 58   | -21846 |  0  |   61  |  21845 |
| 58+  |  21845 |  1  |    5  | -21846 |
| 59   |  21845 |  1  |    5  |  21845 |
| 59+  | -21846 |  1  |   13  |  21845 |
| 60   | -21846 |  1  |   13  | -21846 |
| 60+  | -21846 |  0  |    5  |  21845 |
| 61   | -21846 |  0  |    5  |  21845 |
| 61   | -21846 |  0  |   13  | -21846 |
| 61   | -21846 |  0  |   21  |  21845 |
| 61   | -21846 |  0  |   29  |  21845 |
| 61   | -21846 |  0  |   37  |  21845 |
| 61   | -21846 |  0  |   45  |  21845 |
| 61   | -21846 |  0  |   53  |  21845 |
| 61   | -21846 |  0  |   61  |  21845 |
| 61+  |  21845 |  1  |   13  | -21846 |
| 62   |  21845 |  1  |   13  |  21845 |
| 62+  | -21846 |  1  |   21  |  21845 |
| 63   | -21846 |  1  |   21  | -21846 |
| 63+  | -21846 |  0  |    5  |  21845 |
| 64   | -21846 |  0  |    5  |  21845 |
| 64   | -21846 |  0  |   13  |  21845 |
| 64   | -21846 |  0  |   21  | -21846 |
| 64   | -21846 |  0  |   29  |  21845 |
| 64   | -21846 |  0  |   37  |  21845 |
| 64   | -21846 |  0  |   45  |  21845 |
| 64   | -21846 |  0  |   53  |  21845 |
| 64   | -21846 |  0  |   61  |  21845 |
| 64+  |  21845 |  1  |   21  | -21846 |
| 65   |  21845 |  1  |   21  |  21845 |
| 65+  | -21846 |  1  |   29  |  21845 |
| 66   | -21846 |  1  |   29  | -21846 |
| 66+  | -21846 |  0  |    5  |  21845 |
| 67   | -21846 |  0  |    5  |  21845 |
| 67   | -21846 |  0  |   13  |  21845 |
| 67   | -21846 |  0  |   21  |  21845 |
| 67   | -21846 |  0  |   29  | -21846 |
| 67   | -21846 |  0  |   37  |  21845 |
| 67   | -21846 |  0  |   45  |  21845 |
| 67   | -21846 |  0  |   53  |  21845 |
| 67   | -21846 |  0  |   61  |  21845 |
| 67+  |  21845 |  1  |   29  | -21846 |
| 68   |  21845 |  1  |   29  |  21845 |
| 68+  | -21846 |  1  |   37  |  21845 |
| 69   | -21846 |  1  |   37  | -21846 |
| 69+  | -21846 |  0  |    5  |  21845 |
| 70   | -21846 |  0  |    5  |  21845 |
| 70   | -21846 |  0  |   13  |  21845 |
| 70   | -21846 |  0  |   21  |  21845 |
| 70   | -21846 |  0  |   29  |  21845 |
| 70   | -21846 |  0  |   37  | -21846 |
| 70   | -21846 |  0  |   45  |  21845 |
| 70   | -21846 |  0  |   53  |  21845 |
| 70   | -21846 |  0  |   61  |  21845 |
| 70+  |  21845 |  1  |   37  | -21846 |
| 71   |  21845 |  1  |   37  |  21845 |
| 71+  | -21846 |  1  |   45  |  21845 |
| 72   | -21846 |  1  |   45  | -21846 |
| 72+  | -21846 |  0  |    5  |  21845 |
| 73   | -21846 |  0  |    5  |  21845 |
| 73   | -21846 |  0  |   13  |  21845 |
| 73   | -21846 |  0  |   21  |  21845 |
| 73   | -21846 |  0  |   29  |  21845 |
| 73   | -21846 |  0  |   37  |  21845 |
| 73   | -21846 |  0  |   45  | -21846 |
| 73   | -21846 |  0  |   53  |  21845 |
| 73   | -21846 |  0  |   61  |  21845 |
| 73+  |  21845 |  1  |   45  | -21846 |
| 74   |  21845 |  1  |   45  |  21845 |
| 74+  | -21846 |  1  |   53  |  21845 |
| 75   | -21846 |  1  |   53  | -21846 |
| 75+  | -21846 |  0  |    5  |  21845 |
| 76   | -21846 |  0  |    5  |  21845 |
| 76   | -21846 |  0  |   13  |  21845 |
| 76   | -21846 |  0  |   21  |  21845 |
| 76   | -21846 |  0  |   29  |  21845 |
| 76   | -21846 |  0  |   37  |  21845 |
| 76   | -21846 |  0  |   45  |  21845 |
| 76   | -21846 |  0  |   53  | -21846 |
| 76   | -21846 |  0  |   61  |  21845 |
| 76+  |  21845 |  1  |   53  | -21846 |
| 77   |  21845 |  1  |   53  |  21845 |
| 77+  | -21846 |  1  |   61  |  21845 |
| 78   | -21846 |  1  |   61  | -21846 |
| 78+  | -21846 |  0  |    5  |  21845 |
| 79   | -21846 |  0  |    5  |  21845 |
| 79   | -21846 |  0  |   13  |  21845 |
| 79   | -21846 |  0  |   21  |  21845 |
| 79   | -21846 |  0  |   29  |  21845 |
| 79   | -21846 |  0  |   37  |  21845 |
| 79   | -21846 |  0  |   45  |  21845 |
| 79   | -21846 |  0  |   53  |  21845 |
| 79   | -21846 |  0  |   61  | -21846 |
| 79+  |  21845 |  1  |   61  | -21846 |
| 80   |  21845 |  1  |   61  |  21845 |
| 80+  |  21845 |  0  |    5  |  21845 |
| 81   |  21845 |  0  |    5  |  21845 |
| 81   |  21845 |  0  |   13  |  21845 |
| 81   |  21845 |  0  |   21  |  21845 |
| 81   |  21845 |  0  |   29  |  21845 |
| 81   |  21845 |  0  |   37  |  21845 |
| 81   |  21845 |  0  |   45  |  21845 |
| 81   |  21845 |  0  |   53  |  21845 |
| 81   |  21845 |  0  |   61  |  21845 |`;

const hdl$2 = `/**
 * Memory of 512 registers, each 16 bit-wide. Out holds the value
 * stored at the memory location specified by address. If load==1, then 
 * the in value is loaded into the memory location specified by address 
 * (the loaded value will be emitted to out from the next time step onward).
 */

CHIP RAM512 {
    IN in[16], load, address[9];
    OUT out[16];
    
    PARTS:
}`;
const tst$2 = `output-list time%S1.4.1 in%D1.6.1 load%B2.1.2 address%D2.3.2 out%D1.6.1;

set in 0,
set load 0,
set address 0,
tick, output; tock, output;

set load 1,
tick, output; tock, output;

set in 13099,
set load 0,
tick, output; tock, output;

set load 1,
set address 130,
tick, output; tock, output;

set load 0,
set address 0,
tick, output; tock, output;

set in 4729,
set address 472,
tick, output; tock, output;

set load 1,
tick, output; tock, output;

set load 0,
tick, output; tock, output;

set address 130,
eval,
output;

set in 5119,
tick, output; tock, output;

set load 1,
set address 511,
tick, output; tock, output;

set load 0,
tick, output; tock, output;

set address 472,
eval,
output;

set address 511,
eval,
output;


set load 0,
set address %B010101000,
tick, output; tock, output;
set address %B010101001, tick, output, tock, output;
set address %B010101010, tick, output, tock, output;
set address %B010101011, tick, output, tock, output;
set address %B010101100, tick, output, tock, output;
set address %B010101101, tick, output, tock, output;
set address %B010101110, tick, output, tock, output;
set address %B010101111, tick, output, tock, output;

set load 1,
set in %B0101010101010101,
set address %B010101000,
tick, output; tock, output;
set address %B010101001,
tick, output, tock, output;
set address %B010101010,
tick, output, tock, output;
set address %B010101011,
tick, output, tock, output;
set address %B010101100,
tick, output, tock, output;
set address %B010101101,
tick, output, tock, output;
set address %B010101110,
tick, output, tock, output;
set address %B010101111,
tick, output, tock, output;

set load 0,
set address %B010101000,
tick, output; tock, output;
set address %B010101001, tick, output, tock, output;
set address %B010101010, tick, output, tock, output;
set address %B010101011, tick, output, tock, output;
set address %B010101100, tick, output, tock, output;
set address %B010101101, tick, output, tock, output;
set address %B010101110, tick, output, tock, output;
set address %B010101111, tick, output, tock, output;

set load 1,
set address %B010101000,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B010101000,
tick, output; tock, output;
set address %B010101001, tick, output, tock, output;
set address %B010101010, tick, output, tock, output;
set address %B010101011, tick, output, tock, output;
set address %B010101100, tick, output, tock, output;
set address %B010101101, tick, output, tock, output;
set address %B010101110, tick, output, tock, output;
set address %B010101111, tick, output, tock, output;

set load 1,
set address %B010101000,
set in %B0101010101010101,
tick, output, tock, output;
set address %B010101001,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B010101000,
tick, output; tock, output;
set address %B010101001, tick, output, tock, output;
set address %B010101010, tick, output, tock, output;
set address %B010101011, tick, output, tock, output;
set address %B010101100, tick, output, tock, output;
set address %B010101101, tick, output, tock, output;
set address %B010101110, tick, output, tock, output;
set address %B010101111, tick, output, tock, output;

set load 1,
set address %B010101001,
set in %B0101010101010101,
tick, output, tock, output;
set address %B010101010,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B010101000,
tick, output; tock, output;
set address %B010101001, tick, output, tock, output;
set address %B010101010, tick, output, tock, output;
set address %B010101011, tick, output, tock, output;
set address %B010101100, tick, output, tock, output;
set address %B010101101, tick, output, tock, output;
set address %B010101110, tick, output, tock, output;
set address %B010101111, tick, output, tock, output;

set load 1,
set address %B010101010,
set in %B0101010101010101,
tick, output, tock, output;
set address %B010101011,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B010101000,
tick, output; tock, output;
set address %B010101001, tick, output, tock, output;
set address %B010101010, tick, output, tock, output;
set address %B010101011, tick, output, tock, output;
set address %B010101100, tick, output, tock, output;
set address %B010101101, tick, output, tock, output;
set address %B010101110, tick, output, tock, output;
set address %B010101111, tick, output, tock, output;

set load 1,
set address %B010101011,
set in %B0101010101010101,
tick, output, tock, output;
set address %B010101100,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B010101000,
tick, output; tock, output;
set address %B010101001, tick, output, tock, output;
set address %B010101010, tick, output, tock, output;
set address %B010101011, tick, output, tock, output;
set address %B010101100, tick, output, tock, output;
set address %B010101101, tick, output, tock, output;
set address %B010101110, tick, output, tock, output;
set address %B010101111, tick, output, tock, output;

set load 1,
set address %B010101100,
set in %B0101010101010101,
tick, output, tock, output;
set address %B010101101,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B010101000,
tick, output; tock, output;
set address %B010101001, tick, output, tock, output;
set address %B010101010, tick, output, tock, output;
set address %B010101011, tick, output, tock, output;
set address %B010101100, tick, output, tock, output;
set address %B010101101, tick, output, tock, output;
set address %B010101110, tick, output, tock, output;
set address %B010101111, tick, output, tock, output;

set load 1,
set address %B010101101,
set in %B0101010101010101,
tick, output, tock, output;
set address %B010101110,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B010101000,
tick, output; tock, output;
set address %B010101001, tick, output, tock, output;
set address %B010101010, tick, output, tock, output;
set address %B010101011, tick, output, tock, output;
set address %B010101100, tick, output, tock, output;
set address %B010101101, tick, output, tock, output;
set address %B010101110, tick, output, tock, output;
set address %B010101111, tick, output, tock, output;

set load 1,
set address %B010101110,
set in %B0101010101010101,
tick, output, tock, output;
set address %B010101111,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B010101000,
tick, output; tock, output;
set address %B010101001, tick, output, tock, output;
set address %B010101010, tick, output, tock, output;
set address %B010101011, tick, output, tock, output;
set address %B010101100, tick, output, tock, output;
set address %B010101101, tick, output, tock, output;
set address %B010101110, tick, output, tock, output;
set address %B010101111, tick, output, tock, output;

set load 1,
set address %B010101111,
set in %B0101010101010101,
tick, output, tock, output;

set load 0,
set address %B010101000,
tick, output; tock, output;
set address %B010101001, tick, output, tock, output;
set address %B010101010, tick, output, tock, output;
set address %B010101011, tick, output, tock, output;
set address %B010101100, tick, output, tock, output;
set address %B010101101, tick, output, tock, output;
set address %B010101110, tick, output, tock, output;
set address %B010101111, tick, output, tock, output;


set load 0,
set address %B000101010,
tick, output; tock, output;
set address %B001101010, tick, output, tock, output;
set address %B010101010, tick, output, tock, output;
set address %B011101010, tick, output, tock, output;
set address %B100101010, tick, output, tock, output;
set address %B101101010, tick, output, tock, output;
set address %B110101010, tick, output, tock, output;
set address %B111101010, tick, output, tock, output;

set load 1,
set in %B0101010101010101,
set address %B000101010,
tick, output; tock, output;
set address %B001101010,
tick, output, tock, output;
set address %B010101010,
tick, output, tock, output;
set address %B011101010,
tick, output, tock, output;
set address %B100101010,
tick, output, tock, output;
set address %B101101010,
tick, output, tock, output;
set address %B110101010,
tick, output, tock, output;
set address %B111101010,
tick, output, tock, output;

set load 0,
set address %B000101010,
tick, output; tock, output;
set address %B001101010, tick, output, tock, output;
set address %B010101010, tick, output, tock, output;
set address %B011101010, tick, output, tock, output;
set address %B100101010, tick, output, tock, output;
set address %B101101010, tick, output, tock, output;
set address %B110101010, tick, output, tock, output;
set address %B111101010, tick, output, tock, output;

set load 1,
set address %B000101010,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B000101010,
tick, output; tock, output;
set address %B001101010, tick, output, tock, output;
set address %B010101010, tick, output, tock, output;
set address %B011101010, tick, output, tock, output;
set address %B100101010, tick, output, tock, output;
set address %B101101010, tick, output, tock, output;
set address %B110101010, tick, output, tock, output;
set address %B111101010, tick, output, tock, output;

set load 1,
set address %B000101010,
set in %B0101010101010101,
tick, output, tock, output;
set address %B001101010,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B000101010,
tick, output; tock, output;
set address %B001101010, tick, output, tock, output;
set address %B010101010, tick, output, tock, output;
set address %B011101010, tick, output, tock, output;
set address %B100101010, tick, output, tock, output;
set address %B101101010, tick, output, tock, output;
set address %B110101010, tick, output, tock, output;
set address %B111101010, tick, output, tock, output;

set load 1,
set address %B001101010,
set in %B0101010101010101,
tick, output, tock, output;
set address %B010101010,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B000101010,
tick, output; tock, output;
set address %B001101010, tick, output, tock, output;
set address %B010101010, tick, output, tock, output;
set address %B011101010, tick, output, tock, output;
set address %B100101010, tick, output, tock, output;
set address %B101101010, tick, output, tock, output;
set address %B110101010, tick, output, tock, output;
set address %B111101010, tick, output, tock, output;

set load 1,
set address %B010101010,
set in %B0101010101010101,
tick, output, tock, output;
set address %B011101010,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B000101010,
tick, output; tock, output;
set address %B001101010, tick, output, tock, output;
set address %B010101010, tick, output, tock, output;
set address %B011101010, tick, output, tock, output;
set address %B100101010, tick, output, tock, output;
set address %B101101010, tick, output, tock, output;
set address %B110101010, tick, output, tock, output;
set address %B111101010, tick, output, tock, output;

set load 1,
set address %B011101010,
set in %B0101010101010101,
tick, output, tock, output;
set address %B100101010,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B000101010,
tick, output; tock, output;
set address %B001101010, tick, output, tock, output;
set address %B010101010, tick, output, tock, output;
set address %B011101010, tick, output, tock, output;
set address %B100101010, tick, output, tock, output;
set address %B101101010, tick, output, tock, output;
set address %B110101010, tick, output, tock, output;
set address %B111101010, tick, output, tock, output;

set load 1,
set address %B100101010,
set in %B0101010101010101,
tick, output, tock, output;
set address %B101101010,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B000101010,
tick, output; tock, output;
set address %B001101010, tick, output, tock, output;
set address %B010101010, tick, output, tock, output;
set address %B011101010, tick, output, tock, output;
set address %B100101010, tick, output, tock, output;
set address %B101101010, tick, output, tock, output;
set address %B110101010, tick, output, tock, output;
set address %B111101010, tick, output, tock, output;

set load 1,
set address %B101101010,
set in %B0101010101010101,
tick, output, tock, output;
set address %B110101010,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B000101010,
tick, output; tock, output;
set address %B001101010, tick, output, tock, output;
set address %B010101010, tick, output, tock, output;
set address %B011101010, tick, output, tock, output;
set address %B100101010, tick, output, tock, output;
set address %B101101010, tick, output, tock, output;
set address %B110101010, tick, output, tock, output;
set address %B111101010, tick, output, tock, output;

set load 1,
set address %B110101010,
set in %B0101010101010101,
tick, output, tock, output;
set address %B111101010,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B000101010,
tick, output; tock, output;
set address %B001101010, tick, output, tock, output;
set address %B010101010, tick, output, tock, output;
set address %B011101010, tick, output, tock, output;
set address %B100101010, tick, output, tock, output;
set address %B101101010, tick, output, tock, output;
set address %B110101010, tick, output, tock, output;
set address %B111101010, tick, output, tock, output;

set load 1,
set address %B111101010,
set in %B0101010101010101,
tick, output, tock, output;

set load 0,
set address %B000101010,
tick, output; tock, output;
set address %B001101010, tick, output, tock, output;
set address %B010101010, tick, output, tock, output;
set address %B011101010, tick, output, tock, output;
set address %B100101010, tick, output, tock, output;
set address %B101101010, tick, output, tock, output;
set address %B110101010, tick, output, tock, output;
set address %B111101010, tick, output, tock, output;`;
const cmp$2 = `| time |   in   |load |address|  out   |
| 0+   |      0 |  0  |    0  |      0 |
| 1    |      0 |  0  |    0  |      0 |
| 1+   |      0 |  1  |    0  |      0 |
| 2    |      0 |  1  |    0  |      0 |
| 2+   |  13099 |  0  |    0  |      0 |
| 3    |  13099 |  0  |    0  |      0 |
| 3+   |  13099 |  1  |  130  |      0 |
| 4    |  13099 |  1  |  130  |  13099 |
| 4+   |  13099 |  0  |    0  |      0 |
| 5    |  13099 |  0  |    0  |      0 |
| 5+   |   4729 |  0  |  472  |      0 |
| 6    |   4729 |  0  |  472  |      0 |
| 6+   |   4729 |  1  |  472  |      0 |
| 7    |   4729 |  1  |  472  |   4729 |
| 7+   |   4729 |  0  |  472  |   4729 |
| 8    |   4729 |  0  |  472  |   4729 |
| 8    |   4729 |  0  |  130  |  13099 |
| 8+   |   5119 |  0  |  130  |  13099 |
| 9    |   5119 |  0  |  130  |  13099 |
| 9+   |   5119 |  1  |  511  |      0 |
| 10   |   5119 |  1  |  511  |   5119 |
| 10+  |   5119 |  0  |  511  |   5119 |
| 11   |   5119 |  0  |  511  |   5119 |
| 11   |   5119 |  0  |  472  |   4729 |
| 11   |   5119 |  0  |  511  |   5119 |
| 11+  |   5119 |  0  |  168  |      0 |
| 12   |   5119 |  0  |  168  |      0 |
| 12   |   5119 |  0  |  169  |      0 |
| 12   |   5119 |  0  |  170  |      0 |
| 12   |   5119 |  0  |  171  |      0 |
| 12   |   5119 |  0  |  172  |      0 |
| 12   |   5119 |  0  |  173  |      0 |
| 12   |   5119 |  0  |  174  |      0 |
| 12   |   5119 |  0  |  175  |      0 |
| 12+  |  21845 |  1  |  168  |      0 |
| 13   |  21845 |  1  |  168  |  21845 |
| 13+  |  21845 |  1  |  169  |      0 |
| 14   |  21845 |  1  |  169  |  21845 |
| 14+  |  21845 |  1  |  170  |      0 |
| 15   |  21845 |  1  |  170  |  21845 |
| 15+  |  21845 |  1  |  171  |      0 |
| 16   |  21845 |  1  |  171  |  21845 |
| 16+  |  21845 |  1  |  172  |      0 |
| 17   |  21845 |  1  |  172  |  21845 |
| 17+  |  21845 |  1  |  173  |      0 |
| 18   |  21845 |  1  |  173  |  21845 |
| 18+  |  21845 |  1  |  174  |      0 |
| 19   |  21845 |  1  |  174  |  21845 |
| 19+  |  21845 |  1  |  175  |      0 |
| 20   |  21845 |  1  |  175  |  21845 |
| 20+  |  21845 |  0  |  168  |  21845 |
| 21   |  21845 |  0  |  168  |  21845 |
| 21   |  21845 |  0  |  169  |  21845 |
| 21   |  21845 |  0  |  170  |  21845 |
| 21   |  21845 |  0  |  171  |  21845 |
| 21   |  21845 |  0  |  172  |  21845 |
| 21   |  21845 |  0  |  173  |  21845 |
| 21   |  21845 |  0  |  174  |  21845 |
| 21   |  21845 |  0  |  175  |  21845 |
| 21+  | -21846 |  1  |  168  |  21845 |
| 22   | -21846 |  1  |  168  | -21846 |
| 22+  | -21846 |  0  |  168  | -21846 |
| 23   | -21846 |  0  |  168  | -21846 |
| 23   | -21846 |  0  |  169  |  21845 |
| 23   | -21846 |  0  |  170  |  21845 |
| 23   | -21846 |  0  |  171  |  21845 |
| 23   | -21846 |  0  |  172  |  21845 |
| 23   | -21846 |  0  |  173  |  21845 |
| 23   | -21846 |  0  |  174  |  21845 |
| 23   | -21846 |  0  |  175  |  21845 |
| 23+  |  21845 |  1  |  168  | -21846 |
| 24   |  21845 |  1  |  168  |  21845 |
| 24+  | -21846 |  1  |  169  |  21845 |
| 25   | -21846 |  1  |  169  | -21846 |
| 25+  | -21846 |  0  |  168  |  21845 |
| 26   | -21846 |  0  |  168  |  21845 |
| 26   | -21846 |  0  |  169  | -21846 |
| 26   | -21846 |  0  |  170  |  21845 |
| 26   | -21846 |  0  |  171  |  21845 |
| 26   | -21846 |  0  |  172  |  21845 |
| 26   | -21846 |  0  |  173  |  21845 |
| 26   | -21846 |  0  |  174  |  21845 |
| 26   | -21846 |  0  |  175  |  21845 |
| 26+  |  21845 |  1  |  169  | -21846 |
| 27   |  21845 |  1  |  169  |  21845 |
| 27+  | -21846 |  1  |  170  |  21845 |
| 28   | -21846 |  1  |  170  | -21846 |
| 28+  | -21846 |  0  |  168  |  21845 |
| 29   | -21846 |  0  |  168  |  21845 |
| 29   | -21846 |  0  |  169  |  21845 |
| 29   | -21846 |  0  |  170  | -21846 |
| 29   | -21846 |  0  |  171  |  21845 |
| 29   | -21846 |  0  |  172  |  21845 |
| 29   | -21846 |  0  |  173  |  21845 |
| 29   | -21846 |  0  |  174  |  21845 |
| 29   | -21846 |  0  |  175  |  21845 |
| 29+  |  21845 |  1  |  170  | -21846 |
| 30   |  21845 |  1  |  170  |  21845 |
| 30+  | -21846 |  1  |  171  |  21845 |
| 31   | -21846 |  1  |  171  | -21846 |
| 31+  | -21846 |  0  |  168  |  21845 |
| 32   | -21846 |  0  |  168  |  21845 |
| 32   | -21846 |  0  |  169  |  21845 |
| 32   | -21846 |  0  |  170  |  21845 |
| 32   | -21846 |  0  |  171  | -21846 |
| 32   | -21846 |  0  |  172  |  21845 |
| 32   | -21846 |  0  |  173  |  21845 |
| 32   | -21846 |  0  |  174  |  21845 |
| 32   | -21846 |  0  |  175  |  21845 |
| 32+  |  21845 |  1  |  171  | -21846 |
| 33   |  21845 |  1  |  171  |  21845 |
| 33+  | -21846 |  1  |  172  |  21845 |
| 34   | -21846 |  1  |  172  | -21846 |
| 34+  | -21846 |  0  |  168  |  21845 |
| 35   | -21846 |  0  |  168  |  21845 |
| 35   | -21846 |  0  |  169  |  21845 |
| 35   | -21846 |  0  |  170  |  21845 |
| 35   | -21846 |  0  |  171  |  21845 |
| 35   | -21846 |  0  |  172  | -21846 |
| 35   | -21846 |  0  |  173  |  21845 |
| 35   | -21846 |  0  |  174  |  21845 |
| 35   | -21846 |  0  |  175  |  21845 |
| 35+  |  21845 |  1  |  172  | -21846 |
| 36   |  21845 |  1  |  172  |  21845 |
| 36+  | -21846 |  1  |  173  |  21845 |
| 37   | -21846 |  1  |  173  | -21846 |
| 37+  | -21846 |  0  |  168  |  21845 |
| 38   | -21846 |  0  |  168  |  21845 |
| 38   | -21846 |  0  |  169  |  21845 |
| 38   | -21846 |  0  |  170  |  21845 |
| 38   | -21846 |  0  |  171  |  21845 |
| 38   | -21846 |  0  |  172  |  21845 |
| 38   | -21846 |  0  |  173  | -21846 |
| 38   | -21846 |  0  |  174  |  21845 |
| 38   | -21846 |  0  |  175  |  21845 |
| 38+  |  21845 |  1  |  173  | -21846 |
| 39   |  21845 |  1  |  173  |  21845 |
| 39+  | -21846 |  1  |  174  |  21845 |
| 40   | -21846 |  1  |  174  | -21846 |
| 40+  | -21846 |  0  |  168  |  21845 |
| 41   | -21846 |  0  |  168  |  21845 |
| 41   | -21846 |  0  |  169  |  21845 |
| 41   | -21846 |  0  |  170  |  21845 |
| 41   | -21846 |  0  |  171  |  21845 |
| 41   | -21846 |  0  |  172  |  21845 |
| 41   | -21846 |  0  |  173  |  21845 |
| 41   | -21846 |  0  |  174  | -21846 |
| 41   | -21846 |  0  |  175  |  21845 |
| 41+  |  21845 |  1  |  174  | -21846 |
| 42   |  21845 |  1  |  174  |  21845 |
| 42+  | -21846 |  1  |  175  |  21845 |
| 43   | -21846 |  1  |  175  | -21846 |
| 43+  | -21846 |  0  |  168  |  21845 |
| 44   | -21846 |  0  |  168  |  21845 |
| 44   | -21846 |  0  |  169  |  21845 |
| 44   | -21846 |  0  |  170  |  21845 |
| 44   | -21846 |  0  |  171  |  21845 |
| 44   | -21846 |  0  |  172  |  21845 |
| 44   | -21846 |  0  |  173  |  21845 |
| 44   | -21846 |  0  |  174  |  21845 |
| 44   | -21846 |  0  |  175  | -21846 |
| 44+  |  21845 |  1  |  175  | -21846 |
| 45   |  21845 |  1  |  175  |  21845 |
| 45+  |  21845 |  0  |  168  |  21845 |
| 46   |  21845 |  0  |  168  |  21845 |
| 46   |  21845 |  0  |  169  |  21845 |
| 46   |  21845 |  0  |  170  |  21845 |
| 46   |  21845 |  0  |  171  |  21845 |
| 46   |  21845 |  0  |  172  |  21845 |
| 46   |  21845 |  0  |  173  |  21845 |
| 46   |  21845 |  0  |  174  |  21845 |
| 46   |  21845 |  0  |  175  |  21845 |
| 46+  |  21845 |  0  |   42  |      0 |
| 47   |  21845 |  0  |   42  |      0 |
| 47   |  21845 |  0  |  106  |      0 |
| 47   |  21845 |  0  |  170  |  21845 |
| 47   |  21845 |  0  |  234  |      0 |
| 47   |  21845 |  0  |  298  |      0 |
| 47   |  21845 |  0  |  362  |      0 |
| 47   |  21845 |  0  |  426  |      0 |
| 47   |  21845 |  0  |  490  |      0 |
| 47+  |  21845 |  1  |   42  |      0 |
| 48   |  21845 |  1  |   42  |  21845 |
| 48+  |  21845 |  1  |  106  |      0 |
| 49   |  21845 |  1  |  106  |  21845 |
| 49+  |  21845 |  1  |  170  |  21845 |
| 50   |  21845 |  1  |  170  |  21845 |
| 50+  |  21845 |  1  |  234  |      0 |
| 51   |  21845 |  1  |  234  |  21845 |
| 51+  |  21845 |  1  |  298  |      0 |
| 52   |  21845 |  1  |  298  |  21845 |
| 52+  |  21845 |  1  |  362  |      0 |
| 53   |  21845 |  1  |  362  |  21845 |
| 53+  |  21845 |  1  |  426  |      0 |
| 54   |  21845 |  1  |  426  |  21845 |
| 54+  |  21845 |  1  |  490  |      0 |
| 55   |  21845 |  1  |  490  |  21845 |
| 55+  |  21845 |  0  |   42  |  21845 |
| 56   |  21845 |  0  |   42  |  21845 |
| 56   |  21845 |  0  |  106  |  21845 |
| 56   |  21845 |  0  |  170  |  21845 |
| 56   |  21845 |  0  |  234  |  21845 |
| 56   |  21845 |  0  |  298  |  21845 |
| 56   |  21845 |  0  |  362  |  21845 |
| 56   |  21845 |  0  |  426  |  21845 |
| 56   |  21845 |  0  |  490  |  21845 |
| 56+  | -21846 |  1  |   42  |  21845 |
| 57   | -21846 |  1  |   42  | -21846 |
| 57+  | -21846 |  0  |   42  | -21846 |
| 58   | -21846 |  0  |   42  | -21846 |
| 58   | -21846 |  0  |  106  |  21845 |
| 58   | -21846 |  0  |  170  |  21845 |
| 58   | -21846 |  0  |  234  |  21845 |
| 58   | -21846 |  0  |  298  |  21845 |
| 58   | -21846 |  0  |  362  |  21845 |
| 58   | -21846 |  0  |  426  |  21845 |
| 58   | -21846 |  0  |  490  |  21845 |
| 58+  |  21845 |  1  |   42  | -21846 |
| 59   |  21845 |  1  |   42  |  21845 |
| 59+  | -21846 |  1  |  106  |  21845 |
| 60   | -21846 |  1  |  106  | -21846 |
| 60+  | -21846 |  0  |   42  |  21845 |
| 61   | -21846 |  0  |   42  |  21845 |
| 61   | -21846 |  0  |  106  | -21846 |
| 61   | -21846 |  0  |  170  |  21845 |
| 61   | -21846 |  0  |  234  |  21845 |
| 61   | -21846 |  0  |  298  |  21845 |
| 61   | -21846 |  0  |  362  |  21845 |
| 61   | -21846 |  0  |  426  |  21845 |
| 61   | -21846 |  0  |  490  |  21845 |
| 61+  |  21845 |  1  |  106  | -21846 |
| 62   |  21845 |  1  |  106  |  21845 |
| 62+  | -21846 |  1  |  170  |  21845 |
| 63   | -21846 |  1  |  170  | -21846 |
| 63+  | -21846 |  0  |   42  |  21845 |
| 64   | -21846 |  0  |   42  |  21845 |
| 64   | -21846 |  0  |  106  |  21845 |
| 64   | -21846 |  0  |  170  | -21846 |
| 64   | -21846 |  0  |  234  |  21845 |
| 64   | -21846 |  0  |  298  |  21845 |
| 64   | -21846 |  0  |  362  |  21845 |
| 64   | -21846 |  0  |  426  |  21845 |
| 64   | -21846 |  0  |  490  |  21845 |
| 64+  |  21845 |  1  |  170  | -21846 |
| 65   |  21845 |  1  |  170  |  21845 |
| 65+  | -21846 |  1  |  234  |  21845 |
| 66   | -21846 |  1  |  234  | -21846 |
| 66+  | -21846 |  0  |   42  |  21845 |
| 67   | -21846 |  0  |   42  |  21845 |
| 67   | -21846 |  0  |  106  |  21845 |
| 67   | -21846 |  0  |  170  |  21845 |
| 67   | -21846 |  0  |  234  | -21846 |
| 67   | -21846 |  0  |  298  |  21845 |
| 67   | -21846 |  0  |  362  |  21845 |
| 67   | -21846 |  0  |  426  |  21845 |
| 67   | -21846 |  0  |  490  |  21845 |
| 67+  |  21845 |  1  |  234  | -21846 |
| 68   |  21845 |  1  |  234  |  21845 |
| 68+  | -21846 |  1  |  298  |  21845 |
| 69   | -21846 |  1  |  298  | -21846 |
| 69+  | -21846 |  0  |   42  |  21845 |
| 70   | -21846 |  0  |   42  |  21845 |
| 70   | -21846 |  0  |  106  |  21845 |
| 70   | -21846 |  0  |  170  |  21845 |
| 70   | -21846 |  0  |  234  |  21845 |
| 70   | -21846 |  0  |  298  | -21846 |
| 70   | -21846 |  0  |  362  |  21845 |
| 70   | -21846 |  0  |  426  |  21845 |
| 70   | -21846 |  0  |  490  |  21845 |
| 70+  |  21845 |  1  |  298  | -21846 |
| 71   |  21845 |  1  |  298  |  21845 |
| 71+  | -21846 |  1  |  362  |  21845 |
| 72   | -21846 |  1  |  362  | -21846 |
| 72+  | -21846 |  0  |   42  |  21845 |
| 73   | -21846 |  0  |   42  |  21845 |
| 73   | -21846 |  0  |  106  |  21845 |
| 73   | -21846 |  0  |  170  |  21845 |
| 73   | -21846 |  0  |  234  |  21845 |
| 73   | -21846 |  0  |  298  |  21845 |
| 73   | -21846 |  0  |  362  | -21846 |
| 73   | -21846 |  0  |  426  |  21845 |
| 73   | -21846 |  0  |  490  |  21845 |
| 73+  |  21845 |  1  |  362  | -21846 |
| 74   |  21845 |  1  |  362  |  21845 |
| 74+  | -21846 |  1  |  426  |  21845 |
| 75   | -21846 |  1  |  426  | -21846 |
| 75+  | -21846 |  0  |   42  |  21845 |
| 76   | -21846 |  0  |   42  |  21845 |
| 76   | -21846 |  0  |  106  |  21845 |
| 76   | -21846 |  0  |  170  |  21845 |
| 76   | -21846 |  0  |  234  |  21845 |
| 76   | -21846 |  0  |  298  |  21845 |
| 76   | -21846 |  0  |  362  |  21845 |
| 76   | -21846 |  0  |  426  | -21846 |
| 76   | -21846 |  0  |  490  |  21845 |
| 76+  |  21845 |  1  |  426  | -21846 |
| 77   |  21845 |  1  |  426  |  21845 |
| 77+  | -21846 |  1  |  490  |  21845 |
| 78   | -21846 |  1  |  490  | -21846 |
| 78+  | -21846 |  0  |   42  |  21845 |
| 79   | -21846 |  0  |   42  |  21845 |
| 79   | -21846 |  0  |  106  |  21845 |
| 79   | -21846 |  0  |  170  |  21845 |
| 79   | -21846 |  0  |  234  |  21845 |
| 79   | -21846 |  0  |  298  |  21845 |
| 79   | -21846 |  0  |  362  |  21845 |
| 79   | -21846 |  0  |  426  |  21845 |
| 79   | -21846 |  0  |  490  | -21846 |
| 79+  |  21845 |  1  |  490  | -21846 |
| 80   |  21845 |  1  |  490  |  21845 |
| 80+  |  21845 |  0  |   42  |  21845 |
| 81   |  21845 |  0  |   42  |  21845 |
| 81   |  21845 |  0  |  106  |  21845 |
| 81   |  21845 |  0  |  170  |  21845 |
| 81   |  21845 |  0  |  234  |  21845 |
| 81   |  21845 |  0  |  298  |  21845 |
| 81   |  21845 |  0  |  362  |  21845 |
| 81   |  21845 |  0  |  426  |  21845 |
| 81   |  21845 |  0  |  490  |  21845 |`;

const hdl$1 = `/**
 * Memory of 4K registers, each 16 bit-wide. Out holds the value
 * stored at the memory location specified by address. If load==1, then 
 * the in value is loaded into the memory location specified by address 
 * (the loaded value will be emitted to out from the next time step onward).
 */

CHIP RAM4K {
    IN in[16], load, address[12];
    OUT out[16];

    PARTS:
}`;
const tst$1 = `output-list time%S1.4.1 in%D1.6.1 load%B2.1.2 address%D2.4.2 out%D1.6.1;

set in 0,
set load 0,
set address 0,
tick, output; tock, output;

set load 1,
tick, output; tock, output;

set in 1111,
set load 0,
tick, output; tock, output;

set load 1,
set address 1111,
tick, output; tock, output;

set load 0,
set address 0,
tick, output; tock, output;

set in 3513,
set address 3513,
tick, output; tock, output;

set load 1,
tick, output; tock, output;

set load 0,
tick, output; tock, output;

set address 1111,
eval,
output;

set in 4095,
tick, output; tock, output;

set load 1,
set address 4095,
tick, output; tock, output;

set load 0,
tick, output; tock, output;

set address 3513,
eval,
output;

set address 4095,
eval,
output;


set load 0,
set address %B101010101000,
tick, output; tock, output;
set address %B101010101001, tick, output, tock, output;
set address %B101010101010, tick, output, tock, output;
set address %B101010101011, tick, output, tock, output;
set address %B101010101100, tick, output, tock, output;
set address %B101010101101, tick, output, tock, output;
set address %B101010101110, tick, output, tock, output;
set address %B101010101111, tick, output, tock, output;

set load 1,
set in %B0101010101010101,
set address %B101010101000,
tick, output; tock, output;
set address %B101010101001,
tick, output, tock, output;
set address %B101010101010,
tick, output, tock, output;
set address %B101010101011,
tick, output, tock, output;
set address %B101010101100,
tick, output, tock, output;
set address %B101010101101,
tick, output, tock, output;
set address %B101010101110,
tick, output, tock, output;
set address %B101010101111,
tick, output, tock, output;

set load 0,
set address %B101010101000,
tick, output; tock, output;
set address %B101010101001, tick, output, tock, output;
set address %B101010101010, tick, output, tock, output;
set address %B101010101011, tick, output, tock, output;
set address %B101010101100, tick, output, tock, output;
set address %B101010101101, tick, output, tock, output;
set address %B101010101110, tick, output, tock, output;
set address %B101010101111, tick, output, tock, output;

set load 1,
set address %B101010101000,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B101010101000,
tick, output; tock, output;
set address %B101010101001, tick, output, tock, output;
set address %B101010101010, tick, output, tock, output;
set address %B101010101011, tick, output, tock, output;
set address %B101010101100, tick, output, tock, output;
set address %B101010101101, tick, output, tock, output;
set address %B101010101110, tick, output, tock, output;
set address %B101010101111, tick, output, tock, output;

set load 1,
set address %B101010101000,
set in %B0101010101010101,
tick, output, tock, output;
set address %B101010101001,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B101010101000,
tick, output; tock, output;
set address %B101010101001, tick, output, tock, output;
set address %B101010101010, tick, output, tock, output;
set address %B101010101011, tick, output, tock, output;
set address %B101010101100, tick, output, tock, output;
set address %B101010101101, tick, output, tock, output;
set address %B101010101110, tick, output, tock, output;
set address %B101010101111, tick, output, tock, output;

set load 1,
set address %B101010101001,
set in %B0101010101010101,
tick, output, tock, output;
set address %B101010101010,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B101010101000,
tick, output; tock, output;
set address %B101010101001, tick, output, tock, output;
set address %B101010101010, tick, output, tock, output;
set address %B101010101011, tick, output, tock, output;
set address %B101010101100, tick, output, tock, output;
set address %B101010101101, tick, output, tock, output;
set address %B101010101110, tick, output, tock, output;
set address %B101010101111, tick, output, tock, output;

set load 1,
set address %B101010101010,
set in %B0101010101010101,
tick, output, tock, output;
set address %B101010101011,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B101010101000,
tick, output; tock, output;
set address %B101010101001, tick, output, tock, output;
set address %B101010101010, tick, output, tock, output;
set address %B101010101011, tick, output, tock, output;
set address %B101010101100, tick, output, tock, output;
set address %B101010101101, tick, output, tock, output;
set address %B101010101110, tick, output, tock, output;
set address %B101010101111, tick, output, tock, output;

set load 1,
set address %B101010101011,
set in %B0101010101010101,
tick, output, tock, output;
set address %B101010101100,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B101010101000,
tick, output; tock, output;
set address %B101010101001, tick, output, tock, output;
set address %B101010101010, tick, output, tock, output;
set address %B101010101011, tick, output, tock, output;
set address %B101010101100, tick, output, tock, output;
set address %B101010101101, tick, output, tock, output;
set address %B101010101110, tick, output, tock, output;
set address %B101010101111, tick, output, tock, output;

set load 1,
set address %B101010101100,
set in %B0101010101010101,
tick, output, tock, output;
set address %B101010101101,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B101010101000,
tick, output; tock, output;
set address %B101010101001, tick, output, tock, output;
set address %B101010101010, tick, output, tock, output;
set address %B101010101011, tick, output, tock, output;
set address %B101010101100, tick, output, tock, output;
set address %B101010101101, tick, output, tock, output;
set address %B101010101110, tick, output, tock, output;
set address %B101010101111, tick, output, tock, output;

set load 1,
set address %B101010101101,
set in %B0101010101010101,
tick, output, tock, output;
set address %B101010101110,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B101010101000,
tick, output; tock, output;
set address %B101010101001, tick, output, tock, output;
set address %B101010101010, tick, output, tock, output;
set address %B101010101011, tick, output, tock, output;
set address %B101010101100, tick, output, tock, output;
set address %B101010101101, tick, output, tock, output;
set address %B101010101110, tick, output, tock, output;
set address %B101010101111, tick, output, tock, output;

set load 1,
set address %B101010101110,
set in %B0101010101010101,
tick, output, tock, output;
set address %B101010101111,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B101010101000,
tick, output; tock, output;
set address %B101010101001, tick, output, tock, output;
set address %B101010101010, tick, output, tock, output;
set address %B101010101011, tick, output, tock, output;
set address %B101010101100, tick, output, tock, output;
set address %B101010101101, tick, output, tock, output;
set address %B101010101110, tick, output, tock, output;
set address %B101010101111, tick, output, tock, output;

set load 1,
set address %B101010101111,
set in %B0101010101010101,
tick, output, tock, output;

set load 0,
set address %B101010101000,
tick, output; tock, output;
set address %B101010101001, tick, output, tock, output;
set address %B101010101010, tick, output, tock, output;
set address %B101010101011, tick, output, tock, output;
set address %B101010101100, tick, output, tock, output;
set address %B101010101101, tick, output, tock, output;
set address %B101010101110, tick, output, tock, output;
set address %B101010101111, tick, output, tock, output;


set load 0,
set address %B000101010101,
tick, output; tock, output;
set address %B001101010101, tick, output, tock, output;
set address %B010101010101, tick, output, tock, output;
set address %B011101010101, tick, output, tock, output;
set address %B100101010101, tick, output, tock, output;
set address %B101101010101, tick, output, tock, output;
set address %B110101010101, tick, output, tock, output;
set address %B111101010101, tick, output, tock, output;

set load 1,
set in %B0101010101010101,
set address %B000101010101,
tick, output; tock, output;
set address %B001101010101,
tick, output, tock, output;
set address %B010101010101,
tick, output, tock, output;
set address %B011101010101,
tick, output, tock, output;
set address %B100101010101,
tick, output, tock, output;
set address %B101101010101,
tick, output, tock, output;
set address %B110101010101,
tick, output, tock, output;
set address %B111101010101,
tick, output, tock, output;

set load 0,
set address %B000101010101,
tick, output; tock, output;
set address %B001101010101, tick, output, tock, output;
set address %B010101010101, tick, output, tock, output;
set address %B011101010101, tick, output, tock, output;
set address %B100101010101, tick, output, tock, output;
set address %B101101010101, tick, output, tock, output;
set address %B110101010101, tick, output, tock, output;
set address %B111101010101, tick, output, tock, output;

set load 1,
set address %B000101010101,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B000101010101,
tick, output; tock, output;
set address %B001101010101, tick, output, tock, output;
set address %B010101010101, tick, output, tock, output;
set address %B011101010101, tick, output, tock, output;
set address %B100101010101, tick, output, tock, output;
set address %B101101010101, tick, output, tock, output;
set address %B110101010101, tick, output, tock, output;
set address %B111101010101, tick, output, tock, output;

set load 1,
set address %B000101010101,
set in %B0101010101010101,
tick, output, tock, output;
set address %B001101010101,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B000101010101,
tick, output; tock, output;
set address %B001101010101, tick, output, tock, output;
set address %B010101010101, tick, output, tock, output;
set address %B011101010101, tick, output, tock, output;
set address %B100101010101, tick, output, tock, output;
set address %B101101010101, tick, output, tock, output;
set address %B110101010101, tick, output, tock, output;
set address %B111101010101, tick, output, tock, output;

set load 1,
set address %B001101010101,
set in %B0101010101010101,
tick, output, tock, output;
set address %B010101010101,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B000101010101,
tick, output; tock, output;
set address %B001101010101, tick, output, tock, output;
set address %B010101010101, tick, output, tock, output;
set address %B011101010101, tick, output, tock, output;
set address %B100101010101, tick, output, tock, output;
set address %B101101010101, tick, output, tock, output;
set address %B110101010101, tick, output, tock, output;
set address %B111101010101, tick, output, tock, output;

set load 1,
set address %B010101010101,
set in %B0101010101010101,
tick, output, tock, output;
set address %B011101010101,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B000101010101,
tick, output; tock, output;
set address %B001101010101, tick, output, tock, output;
set address %B010101010101, tick, output, tock, output;
set address %B011101010101, tick, output, tock, output;
set address %B100101010101, tick, output, tock, output;
set address %B101101010101, tick, output, tock, output;
set address %B110101010101, tick, output, tock, output;
set address %B111101010101, tick, output, tock, output;

set load 1,
set address %B011101010101,
set in %B0101010101010101,
tick, output, tock, output;
set address %B100101010101,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B000101010101,
tick, output; tock, output;
set address %B001101010101, tick, output, tock, output;
set address %B010101010101, tick, output, tock, output;
set address %B011101010101, tick, output, tock, output;
set address %B100101010101, tick, output, tock, output;
set address %B101101010101, tick, output, tock, output;
set address %B110101010101, tick, output, tock, output;
set address %B111101010101, tick, output, tock, output;

set load 1,
set address %B100101010101,
set in %B0101010101010101,
tick, output, tock, output;
set address %B101101010101,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B000101010101,
tick, output; tock, output;
set address %B001101010101, tick, output, tock, output;
set address %B010101010101, tick, output, tock, output;
set address %B011101010101, tick, output, tock, output;
set address %B100101010101, tick, output, tock, output;
set address %B101101010101, tick, output, tock, output;
set address %B110101010101, tick, output, tock, output;
set address %B111101010101, tick, output, tock, output;

set load 1,
set address %B101101010101,
set in %B0101010101010101,
tick, output, tock, output;
set address %B110101010101,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B000101010101,
tick, output; tock, output;
set address %B001101010101, tick, output, tock, output;
set address %B010101010101, tick, output, tock, output;
set address %B011101010101, tick, output, tock, output;
set address %B100101010101, tick, output, tock, output;
set address %B101101010101, tick, output, tock, output;
set address %B110101010101, tick, output, tock, output;
set address %B111101010101, tick, output, tock, output;

set load 1,
set address %B110101010101,
set in %B0101010101010101,
tick, output, tock, output;
set address %B111101010101,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B000101010101,
tick, output; tock, output;
set address %B001101010101, tick, output, tock, output;
set address %B010101010101, tick, output, tock, output;
set address %B011101010101, tick, output, tock, output;
set address %B100101010101, tick, output, tock, output;
set address %B101101010101, tick, output, tock, output;
set address %B110101010101, tick, output, tock, output;
set address %B111101010101, tick, output, tock, output;

set load 1,
set address %B111101010101,
set in %B0101010101010101,
tick, output, tock, output;

set load 0,
set address %B000101010101,
tick, output; tock, output;
set address %B001101010101, tick, output, tock, output;
set address %B010101010101, tick, output, tock, output;
set address %B011101010101, tick, output, tock, output;
set address %B100101010101, tick, output, tock, output;
set address %B101101010101, tick, output, tock, output;
set address %B110101010101, tick, output, tock, output;
set address %B111101010101, tick, output, tock, output;`;
const cmp$1 = `| time |   in   |load |address |  out   |
| 0+   |      0 |  0  |     0  |      0 |
| 1    |      0 |  0  |     0  |      0 |
| 1+   |      0 |  1  |     0  |      0 |
| 2    |      0 |  1  |     0  |      0 |
| 2+   |   1111 |  0  |     0  |      0 |
| 3    |   1111 |  0  |     0  |      0 |
| 3+   |   1111 |  1  |  1111  |      0 |
| 4    |   1111 |  1  |  1111  |   1111 |
| 4+   |   1111 |  0  |     0  |      0 |
| 5    |   1111 |  0  |     0  |      0 |
| 5+   |   3513 |  0  |  3513  |      0 |
| 6    |   3513 |  0  |  3513  |      0 |
| 6+   |   3513 |  1  |  3513  |      0 |
| 7    |   3513 |  1  |  3513  |   3513 |
| 7+   |   3513 |  0  |  3513  |   3513 |
| 8    |   3513 |  0  |  3513  |   3513 |
| 8    |   3513 |  0  |  1111  |   1111 |
| 8+   |   4095 |  0  |  1111  |   1111 |
| 9    |   4095 |  0  |  1111  |   1111 |
| 9+   |   4095 |  1  |  4095  |      0 |
| 10   |   4095 |  1  |  4095  |   4095 |
| 10+  |   4095 |  0  |  4095  |   4095 |
| 11   |   4095 |  0  |  4095  |   4095 |
| 11   |   4095 |  0  |  3513  |   3513 |
| 11   |   4095 |  0  |  4095  |   4095 |
| 11+  |   4095 |  0  |  2728  |      0 |
| 12   |   4095 |  0  |  2728  |      0 |
| 12   |   4095 |  0  |  2729  |      0 |
| 12   |   4095 |  0  |  2730  |      0 |
| 12   |   4095 |  0  |  2731  |      0 |
| 12   |   4095 |  0  |  2732  |      0 |
| 12   |   4095 |  0  |  2733  |      0 |
| 12   |   4095 |  0  |  2734  |      0 |
| 12   |   4095 |  0  |  2735  |      0 |
| 12+  |  21845 |  1  |  2728  |      0 |
| 13   |  21845 |  1  |  2728  |  21845 |
| 13+  |  21845 |  1  |  2729  |      0 |
| 14   |  21845 |  1  |  2729  |  21845 |
| 14+  |  21845 |  1  |  2730  |      0 |
| 15   |  21845 |  1  |  2730  |  21845 |
| 15+  |  21845 |  1  |  2731  |      0 |
| 16   |  21845 |  1  |  2731  |  21845 |
| 16+  |  21845 |  1  |  2732  |      0 |
| 17   |  21845 |  1  |  2732  |  21845 |
| 17+  |  21845 |  1  |  2733  |      0 |
| 18   |  21845 |  1  |  2733  |  21845 |
| 18+  |  21845 |  1  |  2734  |      0 |
| 19   |  21845 |  1  |  2734  |  21845 |
| 19+  |  21845 |  1  |  2735  |      0 |
| 20   |  21845 |  1  |  2735  |  21845 |
| 20+  |  21845 |  0  |  2728  |  21845 |
| 21   |  21845 |  0  |  2728  |  21845 |
| 21   |  21845 |  0  |  2729  |  21845 |
| 21   |  21845 |  0  |  2730  |  21845 |
| 21   |  21845 |  0  |  2731  |  21845 |
| 21   |  21845 |  0  |  2732  |  21845 |
| 21   |  21845 |  0  |  2733  |  21845 |
| 21   |  21845 |  0  |  2734  |  21845 |
| 21   |  21845 |  0  |  2735  |  21845 |
| 21+  | -21846 |  1  |  2728  |  21845 |
| 22   | -21846 |  1  |  2728  | -21846 |
| 22+  | -21846 |  0  |  2728  | -21846 |
| 23   | -21846 |  0  |  2728  | -21846 |
| 23   | -21846 |  0  |  2729  |  21845 |
| 23   | -21846 |  0  |  2730  |  21845 |
| 23   | -21846 |  0  |  2731  |  21845 |
| 23   | -21846 |  0  |  2732  |  21845 |
| 23   | -21846 |  0  |  2733  |  21845 |
| 23   | -21846 |  0  |  2734  |  21845 |
| 23   | -21846 |  0  |  2735  |  21845 |
| 23+  |  21845 |  1  |  2728  | -21846 |
| 24   |  21845 |  1  |  2728  |  21845 |
| 24+  | -21846 |  1  |  2729  |  21845 |
| 25   | -21846 |  1  |  2729  | -21846 |
| 25+  | -21846 |  0  |  2728  |  21845 |
| 26   | -21846 |  0  |  2728  |  21845 |
| 26   | -21846 |  0  |  2729  | -21846 |
| 26   | -21846 |  0  |  2730  |  21845 |
| 26   | -21846 |  0  |  2731  |  21845 |
| 26   | -21846 |  0  |  2732  |  21845 |
| 26   | -21846 |  0  |  2733  |  21845 |
| 26   | -21846 |  0  |  2734  |  21845 |
| 26   | -21846 |  0  |  2735  |  21845 |
| 26+  |  21845 |  1  |  2729  | -21846 |
| 27   |  21845 |  1  |  2729  |  21845 |
| 27+  | -21846 |  1  |  2730  |  21845 |
| 28   | -21846 |  1  |  2730  | -21846 |
| 28+  | -21846 |  0  |  2728  |  21845 |
| 29   | -21846 |  0  |  2728  |  21845 |
| 29   | -21846 |  0  |  2729  |  21845 |
| 29   | -21846 |  0  |  2730  | -21846 |
| 29   | -21846 |  0  |  2731  |  21845 |
| 29   | -21846 |  0  |  2732  |  21845 |
| 29   | -21846 |  0  |  2733  |  21845 |
| 29   | -21846 |  0  |  2734  |  21845 |
| 29   | -21846 |  0  |  2735  |  21845 |
| 29+  |  21845 |  1  |  2730  | -21846 |
| 30   |  21845 |  1  |  2730  |  21845 |
| 30+  | -21846 |  1  |  2731  |  21845 |
| 31   | -21846 |  1  |  2731  | -21846 |
| 31+  | -21846 |  0  |  2728  |  21845 |
| 32   | -21846 |  0  |  2728  |  21845 |
| 32   | -21846 |  0  |  2729  |  21845 |
| 32   | -21846 |  0  |  2730  |  21845 |
| 32   | -21846 |  0  |  2731  | -21846 |
| 32   | -21846 |  0  |  2732  |  21845 |
| 32   | -21846 |  0  |  2733  |  21845 |
| 32   | -21846 |  0  |  2734  |  21845 |
| 32   | -21846 |  0  |  2735  |  21845 |
| 32+  |  21845 |  1  |  2731  | -21846 |
| 33   |  21845 |  1  |  2731  |  21845 |
| 33+  | -21846 |  1  |  2732  |  21845 |
| 34   | -21846 |  1  |  2732  | -21846 |
| 34+  | -21846 |  0  |  2728  |  21845 |
| 35   | -21846 |  0  |  2728  |  21845 |
| 35   | -21846 |  0  |  2729  |  21845 |
| 35   | -21846 |  0  |  2730  |  21845 |
| 35   | -21846 |  0  |  2731  |  21845 |
| 35   | -21846 |  0  |  2732  | -21846 |
| 35   | -21846 |  0  |  2733  |  21845 |
| 35   | -21846 |  0  |  2734  |  21845 |
| 35   | -21846 |  0  |  2735  |  21845 |
| 35+  |  21845 |  1  |  2732  | -21846 |
| 36   |  21845 |  1  |  2732  |  21845 |
| 36+  | -21846 |  1  |  2733  |  21845 |
| 37   | -21846 |  1  |  2733  | -21846 |
| 37+  | -21846 |  0  |  2728  |  21845 |
| 38   | -21846 |  0  |  2728  |  21845 |
| 38   | -21846 |  0  |  2729  |  21845 |
| 38   | -21846 |  0  |  2730  |  21845 |
| 38   | -21846 |  0  |  2731  |  21845 |
| 38   | -21846 |  0  |  2732  |  21845 |
| 38   | -21846 |  0  |  2733  | -21846 |
| 38   | -21846 |  0  |  2734  |  21845 |
| 38   | -21846 |  0  |  2735  |  21845 |
| 38+  |  21845 |  1  |  2733  | -21846 |
| 39   |  21845 |  1  |  2733  |  21845 |
| 39+  | -21846 |  1  |  2734  |  21845 |
| 40   | -21846 |  1  |  2734  | -21846 |
| 40+  | -21846 |  0  |  2728  |  21845 |
| 41   | -21846 |  0  |  2728  |  21845 |
| 41   | -21846 |  0  |  2729  |  21845 |
| 41   | -21846 |  0  |  2730  |  21845 |
| 41   | -21846 |  0  |  2731  |  21845 |
| 41   | -21846 |  0  |  2732  |  21845 |
| 41   | -21846 |  0  |  2733  |  21845 |
| 41   | -21846 |  0  |  2734  | -21846 |
| 41   | -21846 |  0  |  2735  |  21845 |
| 41+  |  21845 |  1  |  2734  | -21846 |
| 42   |  21845 |  1  |  2734  |  21845 |
| 42+  | -21846 |  1  |  2735  |  21845 |
| 43   | -21846 |  1  |  2735  | -21846 |
| 43+  | -21846 |  0  |  2728  |  21845 |
| 44   | -21846 |  0  |  2728  |  21845 |
| 44   | -21846 |  0  |  2729  |  21845 |
| 44   | -21846 |  0  |  2730  |  21845 |
| 44   | -21846 |  0  |  2731  |  21845 |
| 44   | -21846 |  0  |  2732  |  21845 |
| 44   | -21846 |  0  |  2733  |  21845 |
| 44   | -21846 |  0  |  2734  |  21845 |
| 44   | -21846 |  0  |  2735  | -21846 |
| 44+  |  21845 |  1  |  2735  | -21846 |
| 45   |  21845 |  1  |  2735  |  21845 |
| 45+  |  21845 |  0  |  2728  |  21845 |
| 46   |  21845 |  0  |  2728  |  21845 |
| 46   |  21845 |  0  |  2729  |  21845 |
| 46   |  21845 |  0  |  2730  |  21845 |
| 46   |  21845 |  0  |  2731  |  21845 |
| 46   |  21845 |  0  |  2732  |  21845 |
| 46   |  21845 |  0  |  2733  |  21845 |
| 46   |  21845 |  0  |  2734  |  21845 |
| 46   |  21845 |  0  |  2735  |  21845 |
| 46+  |  21845 |  0  |   341  |      0 |
| 47   |  21845 |  0  |   341  |      0 |
| 47   |  21845 |  0  |   853  |      0 |
| 47   |  21845 |  0  |  1365  |      0 |
| 47   |  21845 |  0  |  1877  |      0 |
| 47   |  21845 |  0  |  2389  |      0 |
| 47   |  21845 |  0  |  2901  |      0 |
| 47   |  21845 |  0  |  3413  |      0 |
| 47   |  21845 |  0  |  3925  |      0 |
| 47+  |  21845 |  1  |   341  |      0 |
| 48   |  21845 |  1  |   341  |  21845 |
| 48+  |  21845 |  1  |   853  |      0 |
| 49   |  21845 |  1  |   853  |  21845 |
| 49+  |  21845 |  1  |  1365  |      0 |
| 50   |  21845 |  1  |  1365  |  21845 |
| 50+  |  21845 |  1  |  1877  |      0 |
| 51   |  21845 |  1  |  1877  |  21845 |
| 51+  |  21845 |  1  |  2389  |      0 |
| 52   |  21845 |  1  |  2389  |  21845 |
| 52+  |  21845 |  1  |  2901  |      0 |
| 53   |  21845 |  1  |  2901  |  21845 |
| 53+  |  21845 |  1  |  3413  |      0 |
| 54   |  21845 |  1  |  3413  |  21845 |
| 54+  |  21845 |  1  |  3925  |      0 |
| 55   |  21845 |  1  |  3925  |  21845 |
| 55+  |  21845 |  0  |   341  |  21845 |
| 56   |  21845 |  0  |   341  |  21845 |
| 56   |  21845 |  0  |   853  |  21845 |
| 56   |  21845 |  0  |  1365  |  21845 |
| 56   |  21845 |  0  |  1877  |  21845 |
| 56   |  21845 |  0  |  2389  |  21845 |
| 56   |  21845 |  0  |  2901  |  21845 |
| 56   |  21845 |  0  |  3413  |  21845 |
| 56   |  21845 |  0  |  3925  |  21845 |
| 56+  | -21846 |  1  |   341  |  21845 |
| 57   | -21846 |  1  |   341  | -21846 |
| 57+  | -21846 |  0  |   341  | -21846 |
| 58   | -21846 |  0  |   341  | -21846 |
| 58   | -21846 |  0  |   853  |  21845 |
| 58   | -21846 |  0  |  1365  |  21845 |
| 58   | -21846 |  0  |  1877  |  21845 |
| 58   | -21846 |  0  |  2389  |  21845 |
| 58   | -21846 |  0  |  2901  |  21845 |
| 58   | -21846 |  0  |  3413  |  21845 |
| 58   | -21846 |  0  |  3925  |  21845 |
| 58+  |  21845 |  1  |   341  | -21846 |
| 59   |  21845 |  1  |   341  |  21845 |
| 59+  | -21846 |  1  |   853  |  21845 |
| 60   | -21846 |  1  |   853  | -21846 |
| 60+  | -21846 |  0  |   341  |  21845 |
| 61   | -21846 |  0  |   341  |  21845 |
| 61   | -21846 |  0  |   853  | -21846 |
| 61   | -21846 |  0  |  1365  |  21845 |
| 61   | -21846 |  0  |  1877  |  21845 |
| 61   | -21846 |  0  |  2389  |  21845 |
| 61   | -21846 |  0  |  2901  |  21845 |
| 61   | -21846 |  0  |  3413  |  21845 |
| 61   | -21846 |  0  |  3925  |  21845 |
| 61+  |  21845 |  1  |   853  | -21846 |
| 62   |  21845 |  1  |   853  |  21845 |
| 62+  | -21846 |  1  |  1365  |  21845 |
| 63   | -21846 |  1  |  1365  | -21846 |
| 63+  | -21846 |  0  |   341  |  21845 |
| 64   | -21846 |  0  |   341  |  21845 |
| 64   | -21846 |  0  |   853  |  21845 |
| 64   | -21846 |  0  |  1365  | -21846 |
| 64   | -21846 |  0  |  1877  |  21845 |
| 64   | -21846 |  0  |  2389  |  21845 |
| 64   | -21846 |  0  |  2901  |  21845 |
| 64   | -21846 |  0  |  3413  |  21845 |
| 64   | -21846 |  0  |  3925  |  21845 |
| 64+  |  21845 |  1  |  1365  | -21846 |
| 65   |  21845 |  1  |  1365  |  21845 |
| 65+  | -21846 |  1  |  1877  |  21845 |
| 66   | -21846 |  1  |  1877  | -21846 |
| 66+  | -21846 |  0  |   341  |  21845 |
| 67   | -21846 |  0  |   341  |  21845 |
| 67   | -21846 |  0  |   853  |  21845 |
| 67   | -21846 |  0  |  1365  |  21845 |
| 67   | -21846 |  0  |  1877  | -21846 |
| 67   | -21846 |  0  |  2389  |  21845 |
| 67   | -21846 |  0  |  2901  |  21845 |
| 67   | -21846 |  0  |  3413  |  21845 |
| 67   | -21846 |  0  |  3925  |  21845 |
| 67+  |  21845 |  1  |  1877  | -21846 |
| 68   |  21845 |  1  |  1877  |  21845 |
| 68+  | -21846 |  1  |  2389  |  21845 |
| 69   | -21846 |  1  |  2389  | -21846 |
| 69+  | -21846 |  0  |   341  |  21845 |
| 70   | -21846 |  0  |   341  |  21845 |
| 70   | -21846 |  0  |   853  |  21845 |
| 70   | -21846 |  0  |  1365  |  21845 |
| 70   | -21846 |  0  |  1877  |  21845 |
| 70   | -21846 |  0  |  2389  | -21846 |
| 70   | -21846 |  0  |  2901  |  21845 |
| 70   | -21846 |  0  |  3413  |  21845 |
| 70   | -21846 |  0  |  3925  |  21845 |
| 70+  |  21845 |  1  |  2389  | -21846 |
| 71   |  21845 |  1  |  2389  |  21845 |
| 71+  | -21846 |  1  |  2901  |  21845 |
| 72   | -21846 |  1  |  2901  | -21846 |
| 72+  | -21846 |  0  |   341  |  21845 |
| 73   | -21846 |  0  |   341  |  21845 |
| 73   | -21846 |  0  |   853  |  21845 |
| 73   | -21846 |  0  |  1365  |  21845 |
| 73   | -21846 |  0  |  1877  |  21845 |
| 73   | -21846 |  0  |  2389  |  21845 |
| 73   | -21846 |  0  |  2901  | -21846 |
| 73   | -21846 |  0  |  3413  |  21845 |
| 73   | -21846 |  0  |  3925  |  21845 |
| 73+  |  21845 |  1  |  2901  | -21846 |
| 74   |  21845 |  1  |  2901  |  21845 |
| 74+  | -21846 |  1  |  3413  |  21845 |
| 75   | -21846 |  1  |  3413  | -21846 |
| 75+  | -21846 |  0  |   341  |  21845 |
| 76   | -21846 |  0  |   341  |  21845 |
| 76   | -21846 |  0  |   853  |  21845 |
| 76   | -21846 |  0  |  1365  |  21845 |
| 76   | -21846 |  0  |  1877  |  21845 |
| 76   | -21846 |  0  |  2389  |  21845 |
| 76   | -21846 |  0  |  2901  |  21845 |
| 76   | -21846 |  0  |  3413  | -21846 |
| 76   | -21846 |  0  |  3925  |  21845 |
| 76+  |  21845 |  1  |  3413  | -21846 |
| 77   |  21845 |  1  |  3413  |  21845 |
| 77+  | -21846 |  1  |  3925  |  21845 |
| 78   | -21846 |  1  |  3925  | -21846 |
| 78+  | -21846 |  0  |   341  |  21845 |
| 79   | -21846 |  0  |   341  |  21845 |
| 79   | -21846 |  0  |   853  |  21845 |
| 79   | -21846 |  0  |  1365  |  21845 |
| 79   | -21846 |  0  |  1877  |  21845 |
| 79   | -21846 |  0  |  2389  |  21845 |
| 79   | -21846 |  0  |  2901  |  21845 |
| 79   | -21846 |  0  |  3413  |  21845 |
| 79   | -21846 |  0  |  3925  | -21846 |
| 79+  |  21845 |  1  |  3925  | -21846 |
| 80   |  21845 |  1  |  3925  |  21845 |
| 80+  |  21845 |  0  |   341  |  21845 |
| 81   |  21845 |  0  |   341  |  21845 |
| 81   |  21845 |  0  |   853  |  21845 |
| 81   |  21845 |  0  |  1365  |  21845 |
| 81   |  21845 |  0  |  1877  |  21845 |
| 81   |  21845 |  0  |  2389  |  21845 |
| 81   |  21845 |  0  |  2901  |  21845 |
| 81   |  21845 |  0  |  3413  |  21845 |
| 81   |  21845 |  0  |  3925  |  21845 |`;

const hdl = `
CHIP RAM16K {
    IN in[16], load, address[14];
    OUT out[16];

    PARTS:
}`;
const tst = `output-list time%S1.4.1 in%D1.6.1 load%B2.1.2 address%D2.5.2 out%D1.6.1;

set in 0,
set load 0,
set address 0,
tick, output; tock, output;

set load 1,
tick, output; tock, output;

set in 4321,
set load 0,
tick, output; tock, output;

set load 1,
set address 4321,
tick, output; tock, output;

set load 0,
set address 0,
tick, output; tock, output;

set in 12345,
set address 12345,
tick, output; tock, output;

set load 1,
tick, output; tock, output;

set load 0,
tick, output; tock, output;

set address 4321,
eval,
output;

set in 16383,
tick, output; tock, output;

set load 1,
set address 16383,
tick, output; tock, output;

set load 0,
tick, output; tock, output;

set address 12345,
eval,
output;

set address 16383,
eval,
output;


set load 0,
set address %B10101010101000,
tick, output; tock, output;
set address %B10101010101001, eval, output;
set address %B10101010101010, eval, output;
set address %B10101010101011, eval, output;
set address %B10101010101100, eval, output;
set address %B10101010101101, eval, output;
set address %B10101010101110, eval, output;
set address %B10101010101111, eval, output;

set load 1,
set in %B0101010101010101,
set address %B10101010101000,
tick, output; tock, output;
set address %B10101010101001,
tick, output, tock, output;
set address %B10101010101010,
tick, output, tock, output;
set address %B10101010101011,
tick, output, tock, output;
set address %B10101010101100,
tick, output, tock, output;
set address %B10101010101101,
tick, output, tock, output;
set address %B10101010101110,
tick, output, tock, output;
set address %B10101010101111,
tick, output, tock, output;

set load 0,
set address %B10101010101000,
tick, output; tock, output;
set address %B10101010101001, eval, output;
set address %B10101010101010, eval, output;
set address %B10101010101011, eval, output;
set address %B10101010101100, eval, output;
set address %B10101010101101, eval, output;
set address %B10101010101110, eval, output;
set address %B10101010101111, eval, output;

set load 1,
set address %B10101010101000,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B10101010101000,
tick, output; tock, output;
set address %B10101010101001, eval, output;
set address %B10101010101010, eval, output;
set address %B10101010101011, eval, output;
set address %B10101010101100, eval, output;
set address %B10101010101101, eval, output;
set address %B10101010101110, eval, output;
set address %B10101010101111, eval, output;

set load 1,
set address %B10101010101000,
set in %B0101010101010101,
tick, output, tock, output;
set address %B10101010101001,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B10101010101000,
tick, output; tock, output;
set address %B10101010101001, eval, output;
set address %B10101010101010, eval, output;
set address %B10101010101011, eval, output;
set address %B10101010101100, eval, output;
set address %B10101010101101, eval, output;
set address %B10101010101110, eval, output;
set address %B10101010101111, eval, output;

set load 1,
set address %B10101010101001,
set in %B0101010101010101,
tick, output, tock, output;
set address %B10101010101010,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B10101010101000,
tick, output; tock, output;
set address %B10101010101001, eval, output;
set address %B10101010101010, eval, output;
set address %B10101010101011, eval, output;
set address %B10101010101100, eval, output;
set address %B10101010101101, eval, output;
set address %B10101010101110, eval, output;
set address %B10101010101111, eval, output;

set load 1,
set address %B10101010101010,
set in %B0101010101010101,
tick, output, tock, output;
set address %B10101010101011,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B10101010101000,
tick, output; tock, output;
set address %B10101010101001, eval, output;
set address %B10101010101010, eval, output;
set address %B10101010101011, eval, output;
set address %B10101010101100, eval, output;
set address %B10101010101101, eval, output;
set address %B10101010101110, eval, output;
set address %B10101010101111, eval, output;

set load 1,
set address %B10101010101011,
set in %B0101010101010101,
tick, output, tock, output;
set address %B10101010101100,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B10101010101000,
tick, output; tock, output;
set address %B10101010101001, eval, output;
set address %B10101010101010, eval, output;
set address %B10101010101011, eval, output;
set address %B10101010101100, eval, output;
set address %B10101010101101, eval, output;
set address %B10101010101110, eval, output;
set address %B10101010101111, eval, output;

set load 1,
set address %B10101010101100,
set in %B0101010101010101,
tick, output, tock, output;
set address %B10101010101101,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B10101010101000,
tick, output; tock, output;
set address %B10101010101001, eval, output;
set address %B10101010101010, eval, output;
set address %B10101010101011, eval, output;
set address %B10101010101100, eval, output;
set address %B10101010101101, eval, output;
set address %B10101010101110, eval, output;
set address %B10101010101111, eval, output;

set load 1,
set address %B10101010101101,
set in %B0101010101010101,
tick, output, tock, output;
set address %B10101010101110,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B10101010101000,
tick, output; tock, output;
set address %B10101010101001, eval, output;
set address %B10101010101010, eval, output;
set address %B10101010101011, eval, output;
set address %B10101010101100, eval, output;
set address %B10101010101101, eval, output;
set address %B10101010101110, eval, output;
set address %B10101010101111, eval, output;

set load 1,
set address %B10101010101110,
set in %B0101010101010101,
tick, output, tock, output;
set address %B10101010101111,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B10101010101000,
tick, output; tock, output;
set address %B10101010101001, eval, output;
set address %B10101010101010, eval, output;
set address %B10101010101011, eval, output;
set address %B10101010101100, eval, output;
set address %B10101010101101, eval, output;
set address %B10101010101110, eval, output;
set address %B10101010101111, eval, output;

set load 1,
set address %B10101010101111,
set in %B0101010101010101,
tick, output, tock, output;

set load 0,
set address %B10101010101000,
tick, output; tock, output;
set address %B10101010101001, eval, output;
set address %B10101010101010, eval, output;
set address %B10101010101011, eval, output;
set address %B10101010101100, eval, output;
set address %B10101010101101, eval, output;
set address %B10101010101110, eval, output;
set address %B10101010101111, eval, output;


set load 0,
set address %B00010101010101,
tick, output; tock, output;
set address %B00110101010101, eval, output;
set address %B01010101010101, eval, output;
set address %B01110101010101, eval, output;
set address %B10010101010101, eval, output;
set address %B10110101010101, eval, output;
set address %B11010101010101, eval, output;
set address %B11110101010101, eval, output;

set load 1,
set in %B0101010101010101,
set address %B00010101010101,
tick, output; tock, output;
set address %B00110101010101,
tick, output, tock, output;
set address %B01010101010101,
tick, output, tock, output;
set address %B01110101010101,
tick, output, tock, output;
set address %B10010101010101,
tick, output, tock, output;
set address %B10110101010101,
tick, output, tock, output;
set address %B11010101010101,
tick, output, tock, output;
set address %B11110101010101,
tick, output, tock, output;

set load 0,
set address %B00010101010101,
tick, output; tock, output;
set address %B00110101010101, eval, output;
set address %B01010101010101, eval, output;
set address %B01110101010101, eval, output;
set address %B10010101010101, eval, output;
set address %B10110101010101, eval, output;
set address %B11010101010101, eval, output;
set address %B11110101010101, eval, output;

set load 1,
set address %B00010101010101,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B00010101010101,
tick, output; tock, output;
set address %B00110101010101, eval, output;
set address %B01010101010101, eval, output;
set address %B01110101010101, eval, output;
set address %B10010101010101, eval, output;
set address %B10110101010101, eval, output;
set address %B11010101010101, eval, output;
set address %B11110101010101, eval, output;

set load 1,
set address %B00010101010101,
set in %B0101010101010101,
tick, output, tock, output;
set address %B00110101010101,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B00010101010101,
tick, output; tock, output;
set address %B00110101010101, eval, output;
set address %B01010101010101, eval, output;
set address %B01110101010101, eval, output;
set address %B10010101010101, eval, output;
set address %B10110101010101, eval, output;
set address %B11010101010101, eval, output;
set address %B11110101010101, eval, output;

set load 1,
set address %B00110101010101,
set in %B0101010101010101,
tick, output, tock, output;
set address %B01010101010101,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B00010101010101,
tick, output; tock, output;
set address %B00110101010101, eval, output;
set address %B01010101010101, eval, output;
set address %B01110101010101, eval, output;
set address %B10010101010101, eval, output;
set address %B10110101010101, eval, output;
set address %B11010101010101, eval, output;
set address %B11110101010101, eval, output;

set load 1,
set address %B01010101010101,
set in %B0101010101010101,
tick, output, tock, output;
set address %B01110101010101,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B00010101010101,
tick, output; tock, output;
set address %B00110101010101, eval, output;
set address %B01010101010101, eval, output;
set address %B01110101010101, eval, output;
set address %B10010101010101, eval, output;
set address %B10110101010101, eval, output;
set address %B11010101010101, eval, output;
set address %B11110101010101, eval, output;

set load 1,
set address %B01110101010101,
set in %B0101010101010101,
tick, output, tock, output;
set address %B10010101010101,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B00010101010101,
tick, output; tock, output;
set address %B00110101010101, eval, output;
set address %B01010101010101, eval, output;
set address %B01110101010101, eval, output;
set address %B10010101010101, eval, output;
set address %B10110101010101, eval, output;
set address %B11010101010101, eval, output;
set address %B11110101010101, eval, output;

set load 1,
set address %B10010101010101,
set in %B0101010101010101,
tick, output, tock, output;
set address %B10110101010101,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B00010101010101,
tick, output; tock, output;
set address %B00110101010101, eval, output;
set address %B01010101010101, eval, output;
set address %B01110101010101, eval, output;
set address %B10010101010101, eval, output;
set address %B10110101010101, eval, output;
set address %B11010101010101, eval, output;
set address %B11110101010101, eval, output;

set load 1,
set address %B10110101010101,
set in %B0101010101010101,
tick, output, tock, output;
set address %B11010101010101,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B00010101010101,
tick, output; tock, output;
set address %B00110101010101, eval, output;
set address %B01010101010101, eval, output;
set address %B01110101010101, eval, output;
set address %B10010101010101, eval, output;
set address %B10110101010101, eval, output;
set address %B11010101010101, eval, output;
set address %B11110101010101, eval, output;

set load 1,
set address %B11010101010101,
set in %B0101010101010101,
tick, output, tock, output;
set address %B11110101010101,
set in %B1010101010101010,
tick, output; tock, output;

set load 0,
set address %B00010101010101,
tick, output; tock, output;
set address %B00110101010101, eval, output;
set address %B01010101010101, eval, output;
set address %B01110101010101, eval, output;
set address %B10010101010101, eval, output;
set address %B10110101010101, eval, output;
set address %B11010101010101, eval, output;
set address %B11110101010101, eval, output;

set load 1,
set address %B11110101010101,
set in %B0101010101010101,
tick, output, tock, output;

set load 0,
set address %B00010101010101,
tick, output; tock, output;
set address %B00110101010101, eval, output;
set address %B01010101010101, eval, output;
set address %B01110101010101, eval, output;
set address %B10010101010101, eval, output;
set address %B10110101010101, eval, output;
set address %B11010101010101, eval, output;
set address %B11110101010101, eval, output;`;
const cmp = `| time |   in   |load | address |  out   |
| 0+   |      0 |  0  |      0  |      0 |
| 1    |      0 |  0  |      0  |      0 |
| 1+   |      0 |  1  |      0  |      0 |
| 2    |      0 |  1  |      0  |      0 |
| 2+   |   4321 |  0  |      0  |      0 |
| 3    |   4321 |  0  |      0  |      0 |
| 3+   |   4321 |  1  |   4321  |      0 |
| 4    |   4321 |  1  |   4321  |   4321 |
| 4+   |   4321 |  0  |      0  |      0 |
| 5    |   4321 |  0  |      0  |      0 |
| 5+   |  12345 |  0  |  12345  |      0 |
| 6    |  12345 |  0  |  12345  |      0 |
| 6+   |  12345 |  1  |  12345  |      0 |
| 7    |  12345 |  1  |  12345  |  12345 |
| 7+   |  12345 |  0  |  12345  |  12345 |
| 8    |  12345 |  0  |  12345  |  12345 |
| 8    |  12345 |  0  |   4321  |   4321 |
| 8+   |  16383 |  0  |   4321  |   4321 |
| 9    |  16383 |  0  |   4321  |   4321 |
| 9+   |  16383 |  1  |  16383  |      0 |
| 10   |  16383 |  1  |  16383  |  16383 |
| 10+  |  16383 |  0  |  16383  |  16383 |
| 11   |  16383 |  0  |  16383  |  16383 |
| 11   |  16383 |  0  |  12345  |  12345 |
| 11   |  16383 |  0  |  16383  |  16383 |
| 11+  |  16383 |  0  |  10920  |      0 |
| 12   |  16383 |  0  |  10920  |      0 |
| 12   |  16383 |  0  |  10921  |      0 |
| 12   |  16383 |  0  |  10922  |      0 |
| 12   |  16383 |  0  |  10923  |      0 |
| 12   |  16383 |  0  |  10924  |      0 |
| 12   |  16383 |  0  |  10925  |      0 |
| 12   |  16383 |  0  |  10926  |      0 |
| 12   |  16383 |  0  |  10927  |      0 |
| 12+  |  21845 |  1  |  10920  |      0 |
| 13   |  21845 |  1  |  10920  |  21845 |
| 13+  |  21845 |  1  |  10921  |      0 |
| 14   |  21845 |  1  |  10921  |  21845 |
| 14+  |  21845 |  1  |  10922  |      0 |
| 15   |  21845 |  1  |  10922  |  21845 |
| 15+  |  21845 |  1  |  10923  |      0 |
| 16   |  21845 |  1  |  10923  |  21845 |
| 16+  |  21845 |  1  |  10924  |      0 |
| 17   |  21845 |  1  |  10924  |  21845 |
| 17+  |  21845 |  1  |  10925  |      0 |
| 18   |  21845 |  1  |  10925  |  21845 |
| 18+  |  21845 |  1  |  10926  |      0 |
| 19   |  21845 |  1  |  10926  |  21845 |
| 19+  |  21845 |  1  |  10927  |      0 |
| 20   |  21845 |  1  |  10927  |  21845 |
| 20+  |  21845 |  0  |  10920  |  21845 |
| 21   |  21845 |  0  |  10920  |  21845 |
| 21   |  21845 |  0  |  10921  |  21845 |
| 21   |  21845 |  0  |  10922  |  21845 |
| 21   |  21845 |  0  |  10923  |  21845 |
| 21   |  21845 |  0  |  10924  |  21845 |
| 21   |  21845 |  0  |  10925  |  21845 |
| 21   |  21845 |  0  |  10926  |  21845 |
| 21   |  21845 |  0  |  10927  |  21845 |
| 21+  | -21846 |  1  |  10920  |  21845 |
| 22   | -21846 |  1  |  10920  | -21846 |
| 22+  | -21846 |  0  |  10920  | -21846 |
| 23   | -21846 |  0  |  10920  | -21846 |
| 23   | -21846 |  0  |  10921  |  21845 |
| 23   | -21846 |  0  |  10922  |  21845 |
| 23   | -21846 |  0  |  10923  |  21845 |
| 23   | -21846 |  0  |  10924  |  21845 |
| 23   | -21846 |  0  |  10925  |  21845 |
| 23   | -21846 |  0  |  10926  |  21845 |
| 23   | -21846 |  0  |  10927  |  21845 |
| 23+  |  21845 |  1  |  10920  | -21846 |
| 24   |  21845 |  1  |  10920  |  21845 |
| 24+  | -21846 |  1  |  10921  |  21845 |
| 25   | -21846 |  1  |  10921  | -21846 |
| 25+  | -21846 |  0  |  10920  |  21845 |
| 26   | -21846 |  0  |  10920  |  21845 |
| 26   | -21846 |  0  |  10921  | -21846 |
| 26   | -21846 |  0  |  10922  |  21845 |
| 26   | -21846 |  0  |  10923  |  21845 |
| 26   | -21846 |  0  |  10924  |  21845 |
| 26   | -21846 |  0  |  10925  |  21845 |
| 26   | -21846 |  0  |  10926  |  21845 |
| 26   | -21846 |  0  |  10927  |  21845 |
| 26+  |  21845 |  1  |  10921  | -21846 |
| 27   |  21845 |  1  |  10921  |  21845 |
| 27+  | -21846 |  1  |  10922  |  21845 |
| 28   | -21846 |  1  |  10922  | -21846 |
| 28+  | -21846 |  0  |  10920  |  21845 |
| 29   | -21846 |  0  |  10920  |  21845 |
| 29   | -21846 |  0  |  10921  |  21845 |
| 29   | -21846 |  0  |  10922  | -21846 |
| 29   | -21846 |  0  |  10923  |  21845 |
| 29   | -21846 |  0  |  10924  |  21845 |
| 29   | -21846 |  0  |  10925  |  21845 |
| 29   | -21846 |  0  |  10926  |  21845 |
| 29   | -21846 |  0  |  10927  |  21845 |
| 29+  |  21845 |  1  |  10922  | -21846 |
| 30   |  21845 |  1  |  10922  |  21845 |
| 30+  | -21846 |  1  |  10923  |  21845 |
| 31   | -21846 |  1  |  10923  | -21846 |
| 31+  | -21846 |  0  |  10920  |  21845 |
| 32   | -21846 |  0  |  10920  |  21845 |
| 32   | -21846 |  0  |  10921  |  21845 |
| 32   | -21846 |  0  |  10922  |  21845 |
| 32   | -21846 |  0  |  10923  | -21846 |
| 32   | -21846 |  0  |  10924  |  21845 |
| 32   | -21846 |  0  |  10925  |  21845 |
| 32   | -21846 |  0  |  10926  |  21845 |
| 32   | -21846 |  0  |  10927  |  21845 |
| 32+  |  21845 |  1  |  10923  | -21846 |
| 33   |  21845 |  1  |  10923  |  21845 |
| 33+  | -21846 |  1  |  10924  |  21845 |
| 34   | -21846 |  1  |  10924  | -21846 |
| 34+  | -21846 |  0  |  10920  |  21845 |
| 35   | -21846 |  0  |  10920  |  21845 |
| 35   | -21846 |  0  |  10921  |  21845 |
| 35   | -21846 |  0  |  10922  |  21845 |
| 35   | -21846 |  0  |  10923  |  21845 |
| 35   | -21846 |  0  |  10924  | -21846 |
| 35   | -21846 |  0  |  10925  |  21845 |
| 35   | -21846 |  0  |  10926  |  21845 |
| 35   | -21846 |  0  |  10927  |  21845 |
| 35+  |  21845 |  1  |  10924  | -21846 |
| 36   |  21845 |  1  |  10924  |  21845 |
| 36+  | -21846 |  1  |  10925  |  21845 |
| 37   | -21846 |  1  |  10925  | -21846 |
| 37+  | -21846 |  0  |  10920  |  21845 |
| 38   | -21846 |  0  |  10920  |  21845 |
| 38   | -21846 |  0  |  10921  |  21845 |
| 38   | -21846 |  0  |  10922  |  21845 |
| 38   | -21846 |  0  |  10923  |  21845 |
| 38   | -21846 |  0  |  10924  |  21845 |
| 38   | -21846 |  0  |  10925  | -21846 |
| 38   | -21846 |  0  |  10926  |  21845 |
| 38   | -21846 |  0  |  10927  |  21845 |
| 38+  |  21845 |  1  |  10925  | -21846 |
| 39   |  21845 |  1  |  10925  |  21845 |
| 39+  | -21846 |  1  |  10926  |  21845 |
| 40   | -21846 |  1  |  10926  | -21846 |
| 40+  | -21846 |  0  |  10920  |  21845 |
| 41   | -21846 |  0  |  10920  |  21845 |
| 41   | -21846 |  0  |  10921  |  21845 |
| 41   | -21846 |  0  |  10922  |  21845 |
| 41   | -21846 |  0  |  10923  |  21845 |
| 41   | -21846 |  0  |  10924  |  21845 |
| 41   | -21846 |  0  |  10925  |  21845 |
| 41   | -21846 |  0  |  10926  | -21846 |
| 41   | -21846 |  0  |  10927  |  21845 |
| 41+  |  21845 |  1  |  10926  | -21846 |
| 42   |  21845 |  1  |  10926  |  21845 |
| 42+  | -21846 |  1  |  10927  |  21845 |
| 43   | -21846 |  1  |  10927  | -21846 |
| 43+  | -21846 |  0  |  10920  |  21845 |
| 44   | -21846 |  0  |  10920  |  21845 |
| 44   | -21846 |  0  |  10921  |  21845 |
| 44   | -21846 |  0  |  10922  |  21845 |
| 44   | -21846 |  0  |  10923  |  21845 |
| 44   | -21846 |  0  |  10924  |  21845 |
| 44   | -21846 |  0  |  10925  |  21845 |
| 44   | -21846 |  0  |  10926  |  21845 |
| 44   | -21846 |  0  |  10927  | -21846 |
| 44+  |  21845 |  1  |  10927  | -21846 |
| 45   |  21845 |  1  |  10927  |  21845 |
| 45+  |  21845 |  0  |  10920  |  21845 |
| 46   |  21845 |  0  |  10920  |  21845 |
| 46   |  21845 |  0  |  10921  |  21845 |
| 46   |  21845 |  0  |  10922  |  21845 |
| 46   |  21845 |  0  |  10923  |  21845 |
| 46   |  21845 |  0  |  10924  |  21845 |
| 46   |  21845 |  0  |  10925  |  21845 |
| 46   |  21845 |  0  |  10926  |  21845 |
| 46   |  21845 |  0  |  10927  |  21845 |
| 46+  |  21845 |  0  |   1365  |      0 |
| 47   |  21845 |  0  |   1365  |      0 |
| 47   |  21845 |  0  |   3413  |      0 |
| 47   |  21845 |  0  |   5461  |      0 |
| 47   |  21845 |  0  |   7509  |      0 |
| 47   |  21845 |  0  |   9557  |      0 |
| 47   |  21845 |  0  |  11605  |      0 |
| 47   |  21845 |  0  |  13653  |      0 |
| 47   |  21845 |  0  |  15701  |      0 |
| 47+  |  21845 |  1  |   1365  |      0 |
| 48   |  21845 |  1  |   1365  |  21845 |
| 48+  |  21845 |  1  |   3413  |      0 |
| 49   |  21845 |  1  |   3413  |  21845 |
| 49+  |  21845 |  1  |   5461  |      0 |
| 50   |  21845 |  1  |   5461  |  21845 |
| 50+  |  21845 |  1  |   7509  |      0 |
| 51   |  21845 |  1  |   7509  |  21845 |
| 51+  |  21845 |  1  |   9557  |      0 |
| 52   |  21845 |  1  |   9557  |  21845 |
| 52+  |  21845 |  1  |  11605  |      0 |
| 53   |  21845 |  1  |  11605  |  21845 |
| 53+  |  21845 |  1  |  13653  |      0 |
| 54   |  21845 |  1  |  13653  |  21845 |
| 54+  |  21845 |  1  |  15701  |      0 |
| 55   |  21845 |  1  |  15701  |  21845 |
| 55+  |  21845 |  0  |   1365  |  21845 |
| 56   |  21845 |  0  |   1365  |  21845 |
| 56   |  21845 |  0  |   3413  |  21845 |
| 56   |  21845 |  0  |   5461  |  21845 |
| 56   |  21845 |  0  |   7509  |  21845 |
| 56   |  21845 |  0  |   9557  |  21845 |
| 56   |  21845 |  0  |  11605  |  21845 |
| 56   |  21845 |  0  |  13653  |  21845 |
| 56   |  21845 |  0  |  15701  |  21845 |
| 56+  | -21846 |  1  |   1365  |  21845 |
| 57   | -21846 |  1  |   1365  | -21846 |
| 57+  | -21846 |  0  |   1365  | -21846 |
| 58   | -21846 |  0  |   1365  | -21846 |
| 58   | -21846 |  0  |   3413  |  21845 |
| 58   | -21846 |  0  |   5461  |  21845 |
| 58   | -21846 |  0  |   7509  |  21845 |
| 58   | -21846 |  0  |   9557  |  21845 |
| 58   | -21846 |  0  |  11605  |  21845 |
| 58   | -21846 |  0  |  13653  |  21845 |
| 58   | -21846 |  0  |  15701  |  21845 |
| 58+  |  21845 |  1  |   1365  | -21846 |
| 59   |  21845 |  1  |   1365  |  21845 |
| 59+  | -21846 |  1  |   3413  |  21845 |
| 60   | -21846 |  1  |   3413  | -21846 |
| 60+  | -21846 |  0  |   1365  |  21845 |
| 61   | -21846 |  0  |   1365  |  21845 |
| 61   | -21846 |  0  |   3413  | -21846 |
| 61   | -21846 |  0  |   5461  |  21845 |
| 61   | -21846 |  0  |   7509  |  21845 |
| 61   | -21846 |  0  |   9557  |  21845 |
| 61   | -21846 |  0  |  11605  |  21845 |
| 61   | -21846 |  0  |  13653  |  21845 |
| 61   | -21846 |  0  |  15701  |  21845 |
| 61+  |  21845 |  1  |   3413  | -21846 |
| 62   |  21845 |  1  |   3413  |  21845 |
| 62+  | -21846 |  1  |   5461  |  21845 |
| 63   | -21846 |  1  |   5461  | -21846 |
| 63+  | -21846 |  0  |   1365  |  21845 |
| 64   | -21846 |  0  |   1365  |  21845 |
| 64   | -21846 |  0  |   3413  |  21845 |
| 64   | -21846 |  0  |   5461  | -21846 |
| 64   | -21846 |  0  |   7509  |  21845 |
| 64   | -21846 |  0  |   9557  |  21845 |
| 64   | -21846 |  0  |  11605  |  21845 |
| 64   | -21846 |  0  |  13653  |  21845 |
| 64   | -21846 |  0  |  15701  |  21845 |
| 64+  |  21845 |  1  |   5461  | -21846 |
| 65   |  21845 |  1  |   5461  |  21845 |
| 65+  | -21846 |  1  |   7509  |  21845 |
| 66   | -21846 |  1  |   7509  | -21846 |
| 66+  | -21846 |  0  |   1365  |  21845 |
| 67   | -21846 |  0  |   1365  |  21845 |
| 67   | -21846 |  0  |   3413  |  21845 |
| 67   | -21846 |  0  |   5461  |  21845 |
| 67   | -21846 |  0  |   7509  | -21846 |
| 67   | -21846 |  0  |   9557  |  21845 |
| 67   | -21846 |  0  |  11605  |  21845 |
| 67   | -21846 |  0  |  13653  |  21845 |
| 67   | -21846 |  0  |  15701  |  21845 |
| 67+  |  21845 |  1  |   7509  | -21846 |
| 68   |  21845 |  1  |   7509  |  21845 |
| 68+  | -21846 |  1  |   9557  |  21845 |
| 69   | -21846 |  1  |   9557  | -21846 |
| 69+  | -21846 |  0  |   1365  |  21845 |
| 70   | -21846 |  0  |   1365  |  21845 |
| 70   | -21846 |  0  |   3413  |  21845 |
| 70   | -21846 |  0  |   5461  |  21845 |
| 70   | -21846 |  0  |   7509  |  21845 |
| 70   | -21846 |  0  |   9557  | -21846 |
| 70   | -21846 |  0  |  11605  |  21845 |
| 70   | -21846 |  0  |  13653  |  21845 |
| 70   | -21846 |  0  |  15701  |  21845 |
| 70+  |  21845 |  1  |   9557  | -21846 |
| 71   |  21845 |  1  |   9557  |  21845 |
| 71+  | -21846 |  1  |  11605  |  21845 |
| 72   | -21846 |  1  |  11605  | -21846 |
| 72+  | -21846 |  0  |   1365  |  21845 |
| 73   | -21846 |  0  |   1365  |  21845 |
| 73   | -21846 |  0  |   3413  |  21845 |
| 73   | -21846 |  0  |   5461  |  21845 |
| 73   | -21846 |  0  |   7509  |  21845 |
| 73   | -21846 |  0  |   9557  |  21845 |
| 73   | -21846 |  0  |  11605  | -21846 |
| 73   | -21846 |  0  |  13653  |  21845 |
| 73   | -21846 |  0  |  15701  |  21845 |
| 73+  |  21845 |  1  |  11605  | -21846 |
| 74   |  21845 |  1  |  11605  |  21845 |
| 74+  | -21846 |  1  |  13653  |  21845 |
| 75   | -21846 |  1  |  13653  | -21846 |
| 75+  | -21846 |  0  |   1365  |  21845 |
| 76   | -21846 |  0  |   1365  |  21845 |
| 76   | -21846 |  0  |   3413  |  21845 |
| 76   | -21846 |  0  |   5461  |  21845 |
| 76   | -21846 |  0  |   7509  |  21845 |
| 76   | -21846 |  0  |   9557  |  21845 |
| 76   | -21846 |  0  |  11605  |  21845 |
| 76   | -21846 |  0  |  13653  | -21846 |
| 76   | -21846 |  0  |  15701  |  21845 |
| 76+  |  21845 |  1  |  13653  | -21846 |
| 77   |  21845 |  1  |  13653  |  21845 |
| 77+  | -21846 |  1  |  15701  |  21845 |
| 78   | -21846 |  1  |  15701  | -21846 |
| 78+  | -21846 |  0  |   1365  |  21845 |
| 79   | -21846 |  0  |   1365  |  21845 |
| 79   | -21846 |  0  |   3413  |  21845 |
| 79   | -21846 |  0  |   5461  |  21845 |
| 79   | -21846 |  0  |   7509  |  21845 |
| 79   | -21846 |  0  |   9557  |  21845 |
| 79   | -21846 |  0  |  11605  |  21845 |
| 79   | -21846 |  0  |  13653  |  21845 |
| 79   | -21846 |  0  |  15701  | -21846 |
| 79+  |  21845 |  1  |  15701  | -21846 |
| 80   |  21845 |  1  |  15701  |  21845 |
| 80+  |  21845 |  0  |   1365  |  21845 |
| 81   |  21845 |  0  |   1365  |  21845 |
| 81   |  21845 |  0  |   3413  |  21845 |
| 81   |  21845 |  0  |   5461  |  21845 |
| 81   |  21845 |  0  |   7509  |  21845 |
| 81   |  21845 |  0  |   9557  |  21845 |
| 81   |  21845 |  0  |  11605  |  21845 |
| 81   |  21845 |  0  |  13653  |  21845 |
| 81   |  21845 |  0  |  15701  |  21845 |`;

async function resetFiles$1(fs) {
    await fs.pushd("/projects/03");
    await reset(fs, {
        Bit: {
            "Bit.hdl": hdl$7,
            "Bit.tst": tst$7,
            "Bit.cmp": cmp$7,
        },
        Register: {
            "Register.hdl": hdl$6,
            "Register.tst": tst$6,
            "Register.cmp": cmp$6,
        },
        PC: {
            "PC.hdl": hdl$5,
            "PC.tst": tst$5,
            "PC.cmp": cmp$5,
        },
        RAM8: {
            "RAM8.hdl": hdl$4,
            "RAM8.tst": tst$4,
            "RAM8.cmp": cmp$4,
        },
        RAM64: {
            "RAM64.hdl": hdl$3,
            "RAM64.tst": tst$3,
            "RAM64.cmp": cmp$3,
        },
        RAM512: {
            "RAM512.hdl": hdl$2,
            "RAM512.tst": tst$2,
            "RAM512.cmp": cmp$2,
        },
        RAM4k: {
            "RAM4k.hdl": hdl$1,
            "RAM4k.tst": tst$1,
            "RAM4k.cmp": cmp$1,
        },
        RAM16k: {
            "RAM16k.hdl": hdl,
            "RAM16k.tst": tst,
            "RAM16k.cmp": cmp,
        },
    });
    await fs.popd();
}

async function resetFiles(fs) {
    await resetFiles$3(fs);
    await resetFiles$2(fs);
    await resetFiles$1(fs);
}

const App = () => {
    const router = Router.for(urls, "chip");
    const fs = new FileSystem(new LocalStorageFileSystemAdapter());
    fs.stat("/projects/01/Not/Not.hdl").catch(() => resetFiles(fs));
    provide({ fs, status: (status) => statusLine.update(status) });
    const statusLine = div("\u00a0");
    const settings = dialog(article(header(p("Settings"), a$1({
        class: "close",
        href: "#",
        events: {
            click: (e) => {
                e.preventDefault();
                settings.removeAttribute("open");
            },
        },
    })), main(dl(header("Project"), dt("Files"), dd(button({
        events: {
            click: (e) => {
                resetFiles(fs);
                statusLine.update("Reset files in local storage");
            },
        },
    }, "Reset")), dt("References"), dd(a$1({
        href: "https://github.com/davidsouther/computron5k",
        target: "_blank",
    }, "Github")), dd(a$1({
        href: "https://davidsouther.github.io/computron5k/user_guide",
        target: "_blank",
    }, "User Guide"))
    // dt("Numeric Format"),
    // dd(
    //   ButtonBar({
    //     value: "B",
    //     values: ["B", "D", "X", "A"],
    //     events: {
    //       onSelect: () => {},
    //     },
    //   })
    // )
    ))));
    const app = [
        settings,
        header(nav(ul(li(strong(a$1({ href: "https://nand2tetris.org", target: "_blank" }, "NAND2Tetris"), " Online"))), ul(...urls.map((url) => li(link(url)))))),
        router(main({ class: "flex flex-1" })),
        footer({ class: "flex row justify-between" }, statusLine, div({ class: "flex row align-center" }, a$1({ href: "./user_guide/", style: { marginRight: "var(--spacing)" } }, "User\u00a0Guide"), button({
            events: {
                click: () => settings.setAttribute("open", "open"),
            },
        }, "Settings"))),
    ];
    return app;
};

export { App };
