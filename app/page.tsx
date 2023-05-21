"use client";
import { Dispatch, FormEvent, SetStateAction, useEffect, useRef } from "react";
import { useState, Fragment } from "react";
import { Popover, Transition } from "@headlessui/react";
import * as globals from "./src/globals";
import { update_items } from "./src/markets";

type Props = { class: string; item: globals.Item; onclick: () => void };

const qualities = new Map([
  ["covert", { border: "border-covert", shadow: "hover:shadow-covert" }],
  [
    "contraband",
    { border: "border-contraband", shadow: "hover:shadow-contraband" },
  ],
  [
    "extraordinary",
    { border: "border-extraordinary", shadow: "hover:shadow-extraordinary" },
  ],
  [
    "classified",
    { border: "border-classified", shadow: "hover:shadow-classified" },
  ],
  [
    "industrial grade",
    { border: "border-industrial", shadow: "hover:shadow-industrial" },
  ],
  [
    "restricted",
    { border: "border-restricted", shadow: "hover:shadow-restricted" },
  ],
  [
    "mil-spec grade",
    { border: "border-milspec", shadow: "hover:shadow-milspec" },
  ],
]);

function ItemCard(props: Props) {
  return (
    <div onClick={props.onclick} className={props.class}>
      <img
        className="w-full h-auto p-2"
        loading="lazy"
        src={props.item.Image}
      />

      {props.item.Name.length > 0 && (
        <p className="font-bold text-sm mt-4">{props.item.Name}</p>
      )}

      {props.item.Price > 0 && (
        <p className="mt-2 text-sm text-gray-500 text-green-200/60">
          <span className="mr-[0.1em]">$</span>
          {props.item.Price}
        </p>
      )}

      {props.item.Stickers.length > 0 && (
        <div
          className={`absolute flex flex-col-reverse self-end -translate-y-1/2 translate-x-1/4`}
        >
          {props.item.Stickers.map((sticker) => (
            //<button>{sticker.name}</button>
            <div className="group w-full">
              <img
                className="w-10 h-auto opacity-80"
                loading="lazy"
                src={sticker.image}
              />
              <div className="absolute hidden group-hover:block w-[200px] -translate-x-1/2 translate-y-1/4 bg-slate-500">
                {sticker.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type SelectObject = {
  type: string;
};

type MultiSelectObject = {
  type: string;
  selected: boolean;
};

type NumberObject = {
  type: string;
  value: string;
  min: number;
  max: number;
};

type FilterPropsArray<T> = {
  name: string;
  columns: number;
  array: T[];
  setArray: Dispatch<SetStateAction<T[]>>;
};

type FilterProps = {
  name: string;
  array: readonly SelectObject[];
  selected: number;
  setSelected: Dispatch<SetStateAction<number>>;
};

type FilterButtonProps = {
  open: boolean;
  name: string;
};

function FilterButton({ open, name }: FilterButtonProps) {
  return (
    <Popover.Button
      className={`
        ${open ? "" : "text-opacity-90"}
        group w-max inline-flex items-center rounded-md bg-slate-900 shadow-md shadow-blue-100/40 px-3 py-2 text-base font-medium text-white hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
    >
      <span>{name}</span>
    </Popover.Button>
  );
}

function FilterMulti(props: FilterPropsArray<MultiSelectObject>) {
  return (
    <div className="top-16 max-w-sm w-min px-2 flex justify-center">
      <Popover className="relative">
        {({ open }) => (
          <>
            <FilterButton open={open} name={props.name} />
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="shadow-lg z-10 absolute left-1/2 -translate-x-1/2 z-10 mt-3 sm:px-0 lg:max-w-3xl w-max justify-center">
                <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                  <div
                    className={`relative grid gap-8 bg-slate-900 p-7 grid-cols-${props.columns}`}
                  >
                    {props.array.map((option) => (
                      <a
                        onClick={(_) => {
                          option.selected = !option.selected;
                          props.setArray(props.array.concat());
                        }}
                        key={option.type}
                        className={`${
                          option.selected
                            ? ""
                            : "text-gray-500 hover:text-gray-200/60"
                        } flex-1 -m-4 p-1 flex items-center rounded-lg duration-200 cursor-pointer`}
                      >
                        <div className="w-full group">
                          <p className="relative whitespace-nowrap m-auto w-min text-sm text-center font-sm select-none">
                            {option.type}
                            {
                              option.selected && (
                                <div className="absolute rounded-xl duration-200 bg-blue-400/40 group-hover:bg-blue-400/80 w-full scale-105 h-[2.5px] my-0.5" />
                              ) //<div className="absolute -translate-x-1 rounded-lg bg-blue-400/40 w-0.5 h-4"></div>//<svg className="absolute -translate-x-3/4" stroke="#60a5fa" opacity={60} width={15} height={30} viewBox="0 0 5 100"><line x1="0" y1="20" x2="0" y2="80" stroke-width="5"></line></svg>
                            }
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    </div>
  );
}

function FilterSingle(props: FilterProps) {
  return (
    <div className="top-16 max-w-sm w-min px-2 flex justify-center">
      <Popover className="relative">
        {({ open }) => (
          <>
            <FilterButton open={open} name={props.name} />
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="shadow-lg z-10 absolute left-1/2 -translate-x-1/2 z-10 mt-3 sm:px-0 lg:max-w-3xl w-max justify-center">
                <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="relative grid gap-8 bg-slate-900 p-7 grid-cols-1">
                    {props.array.map((option, i) => (
                      <a
                        onClick={(e) => {
                          props.setSelected(i);
                        }}
                        key={option.type}
                        className={`${
                          props.selected == i
                            ? ""
                            : "text-gray-500 hover:text-gray-200/60"
                        } flex-1 -m-4 p-1 flex items-center rounded-lg duration-200 cursor-pointer`}
                      >
                        <div className="w-full">
                          <p className="relative whitespace-nowrap m-auto w-min text-sm text-center font-sm select-none">
                            {option.type}
                            {
                              props.selected == i && (
                                <div className="absolute rounded-xl duration-200 bg-blue-400/80 w-full scale-105 h-[2.5px] my-0.5" />
                              ) //<div className="absolute -translate-x-1 rounded-lg bg-blue-400/40 w-0.5 h-4"></div>//<svg className="absolute -translate-x-3/4" stroke="#60a5fa" opacity={60} width={15} height={30} viewBox="0 0 5 100"><line x1="0" y1="20" x2="0" y2="80" stroke-width="5"></line></svg>
                            }
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    </div>
  );
}

function FilterNumbers(props: FilterPropsArray<NumberObject>) {
  return (
    <div className="top-16 max-w-sm w-min px-2 flex justify-center">
      <Popover className="relative">
        {({ open }) => (
          <>
            <FilterButton open={open} name={props.name} />
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="shadow-lg z-10 absolute left-1/2 -translate-x-1/2 z-10 mt-3 sm:px-0 lg:max-w-3xl w-max justify-center">
                <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                  <div
                    className={`relative grid gap-8 bg-slate-900 p-5 grid-cols-${props.columns}`}
                  >
                    {props.array.map((option) => (
                      <div
                        className="inline-flex mb-3"
                        data-te-input-wrapper-init
                      >
                        <input
                          onChange={(e) => {
                            const val = parseInt(e.currentTarget.value);
                            if ((val && val < option.min) || val > option.max)
                              e.currentTarget.value = option.value;
                          }}
                          onKeyUp={(e) => {
                            if (
                              e.key == "Enter" &&
                              option.value !== e.currentTarget.value
                            ) {
                              option.value = e.currentTarget.value;
                              props.setArray(props.array.concat());
                              e.currentTarget.blur();
                            }
                          }}
                          onBlur={(e) => {
                            if (option.value !== e.currentTarget.value) {
                              option.value = e.currentTarget.value;
                              props.setArray(props.array.concat());
                            }
                          }}
                          defaultValue={option.value}
                          type="number"
                          className="mt-7 w-20 p-1 pl-2 rounded outline-0 shadow-lg shadow-blue-400/40 bg-transparent"
                        />
                        <label className="pointer-events-none absolute">
                          {option.type}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    </div>
  );
}

function FilterNumberArray(props: FilterPropsArray<string>) {
  const [inputValue, setInputValue] = useState("");

  const handleAddNumber = () => {
    if (inputValue.length === 0 || props.array.includes(inputValue)) return;
    props.setArray(props.array.concat([inputValue]));
    setInputValue("");
  };

  return (
    <div className="top-16 max-w-sm w-min px-2 flex justify-center">
      <Popover className="relative">
        {({ open }) => (
          <>
            <FilterButton open={open} name={props.name} />
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="shadow-lg z-10 absolute left-1/2 -translate-x-1/2 z-10 mt-3 sm:px-0 lg:max-w-3xl w-max justify-center">
                <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 bg-slate-900">
                  <div className={`relative flex flex-row gap-x-2 p-5`}>
                    <input
                      onKeyUp={(e) => {
                        if (e.key == "Enter") {
                          handleAddNumber();
                        }
                      }}
                      onChange={(e) => {
                        const val = parseInt(e.currentTarget.value);
                        if (
                          !val ||
                          (val >= 0 &&
                            val <= 9999 &&
                            !e.currentTarget.value.includes("."))
                        )
                          setInputValue(e.currentTarget.value);
                      }}
                      value={inputValue}
                      type="number"
                      className="rounded-lg bg-transparent shadow-lg shadow-blue-400/40 w-40 px-2"
                      placeholder="000"
                    />

                    <button
                      onClick={(_) => {
                        handleAddNumber();
                      }}
                      className="duration-300 hover:scale-105 inline-flex w-10 ml-2 justify-center items-center border-2 border-blue-400/30 rounded-lg "
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 100 100"
                      >
                        <line
                          x1="32.5"
                          y1="50"
                          x2="67.5"
                          y2="50"
                          stroke="#60a5fa"
                          stroke-width="5"
                        ></line>
                        <line
                          x1="50"
                          y1="32.5"
                          x2="50"
                          y2="67.5"
                          stroke="#60a5fa"
                          stroke-width="5"
                        ></line>
                      </svg>
                    </button>
                  </div>
                  <div
                    className={`${
                      props.array.length === 0 ? "hidden" : ""
                    } relative grid grid-cols-4 p-4 gap-x-2 gap-y-2`}
                  >
                    {props.array.map((seed) => (
                      <button
                        onClick={(e) => {
                          const idx = props.array.indexOf(
                            e.currentTarget.innerText
                          );
                          props.setArray(
                            props.array
                              .slice(0, idx)
                              .concat(props.array.slice(idx + 1))
                          );
                        }}
                        className="duration-300 hover:text-red-400/80 text-blue-400/80"
                      >
                        {seed}
                      </button>
                    ))}
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    </div>
  );
}

function GrayCirclePlus() {
  return (
    <div className="bg-gray-900 rounded-2xl shadow-lg shadow-gray-700/40 w-[156px] h-[156px]">
      <svg className="stroke-gray-400" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="20" fill="none" stroke-width="3" />
        <line x1="40" y1="50" x2="60" y2="50" stroke-width="3"></line>
        <line x1="50" y1="40" x2="50" y2="60" stroke-width="3"></line>
      </svg>
    </div>
  );
}

function FilterStickers(props: FilterPropsArray<globals.StickerObject>) {
  const handleAddSticker = (sticker: globals.StickerObject) => {
    if (props.array.length === 4) return;
    props.setArray(props.array.concat([sticker]));
  };

  const [search, setSearch] = useState("");

  let offset = useRef(0);
  let [stickerList, setStickerList] = useState<globals.Item[]>([]);

  const update_stickers_dmarket = async (new_search: boolean = false) => {
    if (new_search) {
      stickerList = [];
      offset.current = 0;
    }

    if (offset.current === -1) return;

    const dmarket_query = {
      limit: "16",
      offset: offset.current.toString(),
      title: search,
    };

    const resp =
      (await fetch(
        `https://api.dmarket.com/exchange/v1/games/placed-filters/cs-stickers?${new URLSearchParams(
          dmarket_query
        )}`,
        { method: "GET", mode: "cors", next: { revalidate: 10 } }
      ).catch((e) => {
        console.log("error:", e);
      })) || null; // cache revalidates after 10 seconds. for no cache: { cache: 'no-store' }

    if (!resp || !resp.ok) return;

    const data = await resp.json();

    if (!data.objects || data.objects.length == 0) {
      if (new_search) setStickerList([]);

      offset.current = -1;
      return;
    }

    for (let i = 0; i < data.objects.length; i++) {
      stickerList.push({
        Name: data.objects[i].title,
        Price: 0,
        Discount: 0,
        Image: data.objects[i].image,
        Quality: "",
        Stickers: [],
        Date: 0,
        Link: "",
      });
    }

    offset.current += 16;
    setStickerList(stickerList.concat());
  };

  let inprogress = false;

  const itemsOnScroll = async (e: any) => {
    if (
      e.currentTarget.scrollTop /
        (e.currentTarget.scrollHeight - e.currentTarget.clientHeight) >=
        0.9 &&
      !inprogress
    ) {
      inprogress = true;
      console.log("doing it");
      await update_stickers_dmarket(false);
      inprogress = false;
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await update_stickers_dmarket(true);
  };

  return (
    <div className="top-16 max-w-sm w-min px-2 flex justify-center">
      <Popover className="relative">
        {({ open }) => (
          <>
            <FilterButton open={open} name={props.name} />
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="shadow-lg z-10 absolute left-1/2 -translate-x-1/2 z-10 mt-3 sm:px-0 lg:max-w-3xl w-max justify-center">
                <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 bg-slate-900">
                  <div className={`relative gap-y-2 p-5`}>
                    <div
                      className={`relative grid grid-cols-4 p-4 gap-x-6 mb-4`}
                    >
                      {props.array.map((sticker, i) => (
                        <div className="bg-gray-900 rounded-2xl shadow-lg shadow-gray-700/40 hover:shadow-red-900/80 hover:scale-105 flex items-center min-h-[156px]">
                          <ItemCard
                            class={"p-1"}
                            item={{
                              Name: "",
                              Price: 0,
                              Discount: 0,
                              Image: sticker.image,
                              Quality: "",
                              Stickers: [],
                              Date: 0,
                              Link: "",
                            }}
                            onclick={() => {
                              props.array.splice(i, 1);
                              props.setArray(props.array.concat());
                            }}
                          />
                        </div>
                      ))}

                      {Array(4 - props.array.length)
                        .fill(0)
                        .map((_) => (
                          <GrayCirclePlus />
                        ))}
                    </div>

                    <form
                      onSubmit={(e) => {
                        handleSubmit(e);
                      }}
                    >
                      <div className="items-center">
                        <label className="sr-only">Search</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg
                              aria-hidden="true"
                              className="w-5 h-5 text-gray-500 dark:text-gray-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fill-rule="evenodd"
                                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                clip-rule="evenodd"
                              ></path>
                            </svg>
                          </div>
                          <input
                            type="text"
                            value={search}
                            onChange={(e) => {
                              setSearch(e.currentTarget.value);
                            }}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="Search"
                          />
                        </div>
                      </div>
                    </form>

                    <div
                      onScroll={itemsOnScroll}
                      className="overflow-auto px-4 my-6 max-h-[18em]"
                    >
                      <div
                        className={`grid grid-cols-1 sm:grid-cols-4 gap-6 my-2`}
                      >
                        {stickerList.map((sticker) => (
                          <ItemCard
                            class={`relative duration-300 rounded-lg px-2 px-2 bg-gray-900/80 py-4 flex flex-col justify-center shadow-lg cursor-pointer`}
                            item={sticker}
                            onclick={() => {
                              if (props.array.length == 4) return;
                              props.setArray(
                                props.array.concat([
                                  {
                                    name: sticker.Name,
                                    image: sticker.Image,
                                  },
                                ])
                              );
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    </div>
  );
}

export default function Home() {
  let [items, setItems] = useState<globals.Item[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState(0);
  const [order, setOrder] = useState(0);
  const [seeds, setSeeds] = useState<string[]>([]);
  const [stickers, setStickers] = useState<globals.StickerObject[]>([]);
  let cursorDMarket = useRef("");
  let cursorCsmoney = useRef(0);
  let inprogress = false;

  const [wears, setWears] = useState<MultiSelectObject[]>([
    { type: "Factory New", selected: false },
    { type: "Minimal Wear", selected: false },
    { type: "Field-Tested", selected: false },
    { type: "Well-Worn", selected: false },
    { type: "Battle-Scarred", selected: false },
  ]);

  const [stattrak, setStatTrak] = useState<MultiSelectObject[]>([
    { type: "StatTrak", selected: false },
    { type: "Regular", selected: false },
  ]);

  const [souvenir, setSouvenir] = useState<MultiSelectObject[]>([
    { type: "Souvenir", selected: false },
    { type: "Regular", selected: false },
  ]);

  const [quality, setQuality] = useState<MultiSelectObject[]>([
    { type: "Consumer Grade", selected: false },
    { type: "Mil-Spec Grade", selected: false },
    { type: "Industrial Grade", selected: false },
    { type: "Restricted", selected: false },
    { type: "Classified", selected: false },
    { type: "Covert", selected: false },
    { type: "Distinguished", selected: false },
    { type: "Exceptional", selected: false },
    { type: "Superior", selected: false },
    { type: "Master", selected: false },
    { type: "Base Grade", selected: false },
    { type: "Extraordinary", selected: false },
    { type: "High Grade", selected: false },
    { type: "Remarkable", selected: false },
    { type: "Exotic", selected: false },
    { type: "Contraband", selected: false },
  ]);

  const [prices, setPrices] = useState<NumberObject[]>([
    { type: "From", value: "", min: 0, max: Infinity },
    { type: "To", value: "", min: 0, max: Infinity },
  ]);

  const [floats, setFloats] = useState<NumberObject[]>([
    { type: "From", value: "", min: 0, max: 1 },
    { type: "To", value: "", min: 0, max: 1 },
  ]);

  const [phases, setPhases] = useState<MultiSelectObject[]>([
    { type: "Phase 1", selected: false },
    { type: "Phase 2", selected: false },
    { type: "Phase 3", selected: false },
    { type: "Phase 4", selected: false },
    { type: "Ruby", selected: false },
    { type: "Emerald", selected: false },
    { type: "Sapphire", selected: false },
    { type: "Black Pearl", selected: false },
  ]);

  const sorts = [
    { type: "Default" },
    { type: "Price" },
    { type: "Discount" },
    { type: "Date Added" },
  ] as const satisfies readonly SelectObject[];

  const orders = [
    { type: "Descending" },
    { type: "Ascending" },
  ] as const satisfies readonly SelectObject[];

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await update_items(true, items, setItems, cursorDMarket, cursorCsmoney, {
      search,
      wears,
      stattrak,
      souvenir,
      floats,
      quality,
      seeds,
      phases,
      stickers,
      prices,
      sort,
      order,
    });
    //await update_dmarket(true);

    console.log("Form submitted successfully!");
  };

  const itemsOnScroll = async (e: any) => {
    if (
      e.currentTarget.scrollTop /
        (e.currentTarget.scrollHeight - e.currentTarget.clientHeight) >=
        0.9 &&
      !inprogress
    ) {
      inprogress = true;
      console.log("doing it");
      await update_items(false, items, setItems, cursorDMarket, cursorCsmoney, {
        search,
        wears,
        stattrak,
        souvenir,
        floats,
        quality,
        seeds,
        phases,
        stickers,
        prices,
        sort,
        order,
      });
      //await update_dmarket();
      inprogress = false;
    }
  };

  // Update items if filters change
  let filter_changes = useRef(0);
  let timeout = setTimeout<[]>(() => {}, 0);

  useEffect(() => {
    filter_changes.current++;
    console.log("filter change detected:", filter_changes.current);

    if (timeout) {
      console.log("clearing timeout");
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      if (filter_changes.current > 1) {
        filter_changes.current--;
        return;
      }

      console.log("searching...");
      update_items(true, items, setItems, cursorDMarket, cursorCsmoney, {
        search,
        wears,
        stattrak,
        souvenir,
        floats,
        quality,
        seeds,
        phases,
        stickers,
        prices,
        sort,
        order,
      }).then((_) => filter_changes.current--);
    }, 1500);
  }, [
    wears,
    stattrak,
    souvenir,
    prices,
    floats,
    quality,
    seeds,
    sort,
    order,
    phases,
    stickers,
  ]);

  return (
    <main>
      <section className="w-full px-8 text-gray-700 bg-slate-900 tails-selected-element">
        <div className="container flex flex-col flex-wrap items-center justify-between py-5 mx-auto md:flex-row max-w-7xl tails-preview">
          <div className="relative flex flex-col md:flex-row">
            <a
              href="#_"
              className="flex items-center mb-5 font-medium text-gray-900 lg:w-auto lg:items-center lg:justify-center md:mb-0"
            >
              <span className="mx-auto text-xl font-black leading-none text-gray-900 select-none">
                tails
                <span className="text-indigo-600" data-primary="indigo-600">
                  .
                </span>
              </span>
            </a>
            <nav className="flex flex-wrap items-center mb-5 text-base md:mb-0 md:pl-8 md:ml-8 md:border-l md:border-gray-200">
              <a
                href="#_"
                className="mr-5 font-medium leading-6 text-gray-600 hover:text-gray-900"
              >
                Home
              </a>
              <a
                href="#_"
                className="mr-5 font-medium leading-6 text-gray-600 hover:text-gray-900"
              >
                Features
              </a>
              <a
                href="#_"
                className="mr-5 font-medium leading-6 text-gray-600 hover:text-gray-900"
              >
                Pricing
              </a>
              <a
                href="#_"
                className="mr-5 font-medium leading-6 text-gray-600 hover:text-gray-900"
              >
                Blog
              </a>
            </nav>
          </div>

          <div className="inline-flex items-center ml-5 space-x-6 lg:justify-end">
            <a
              href="#"
              className="text-base font-medium leading-6 text-gray-600 whitespace-no-wrap transition duration-150 ease-in-out hover:text-gray-900"
            >
              Sign in
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center px-4 py-2 text-base font-medium leading-6 text-white whitespace-no-wrap bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
              data-rounded="rounded-md"
              data-primary="indigo-600"
            >
              Sign up
            </a>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-slate-900 tails-selected-element">
        <div className="max-w-7xl px-10 mx-auto sm:text-center">
          <p className="text-blue-500 font-medium uppercase">
            Our Application Integrations
          </p>
          <h2 className="font-bold text-3xl sm:text-4xl lg:text-5xl mt-3">
            Connect with Your Favorite Apps.
          </h2>
          <p className="mt-4 text-gray-500 text-base sm:text-xl lg:text-2xl">
            We've built integrations with some of your favorite services.
            <br className="lg:hidden hidden sm:block" /> Check'em out below
          </p>
          <br />
          <div className="flex items-center sm:justify-between justify-end py-5 flex-row flex-wrap gap-y-4">
            <div className="relative flex flex-row">
              <FilterSingle
                name="Sort By"
                array={sorts}
                selected={sort}
                setSelected={setSort}
              />
              <FilterSingle
                name="Order"
                array={orders}
                selected={order}
                setSelected={setOrder}
              />
            </div>

            <div className="inline-flex items-center justify-end flex-wrap-reverse gap-y-5">
              <FilterStickers
                columns={4}
                name="Stickers"
                array={stickers}
                setArray={setStickers}
              />
              <FilterMulti
                columns={2}
                name="Phase"
                array={phases}
                setArray={setPhases}
              />
              <FilterNumberArray
                columns={4}
                name="Seed"
                array={seeds}
                setArray={setSeeds}
              />
              <FilterMulti
                columns={4}
                name="Quality"
                array={quality}
                setArray={setQuality}
              />
              <FilterNumbers
                columns={2}
                name="Float"
                array={floats}
                setArray={setFloats}
              />
              <FilterNumbers
                columns={2}
                name="Price"
                array={prices}
                setArray={setPrices}
              />
              <FilterMulti
                columns={1}
                name="Souvenir"
                array={souvenir}
                setArray={setSouvenir}
              />
              <FilterMulti
                columns={1}
                name="StatTrak"
                array={stattrak}
                setArray={setStatTrak}
              />
              <FilterMulti
                columns={1}
                name="Condition"
                array={wears}
                setArray={setWears}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex items-center">
              <label className="sr-only">Search</label>
              <div className="relative w-screen">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg
                    aria-hidden="true"
                    className="w-5 h-5 text-gray-500 dark:text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.currentTarget.value);
                  }}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Search"
                />
              </div>
            </div>
          </form>

          <br />

          <div
            onScroll={itemsOnScroll}
            className="max-w-screen max-h-screen overflow-auto px-4 my-10 sm:my-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 my-2">
              {items.map((item) => (
                <ItemCard
                  class={`relative hover:z-10 duration-300 ${
                    qualities.get(item.Quality)?.shadow
                  } rounded-lg px-2 px-2 bg-gray-900/80 hover:scale-105 hover:shadow-sm border py-8 flex flex-col justify-center shadow-lg ${
                    qualities.get(item.Quality)?.border
                  } cursor-pointer`}
                  item={item}
                  onclick={() => {
                    window.open(item.Link);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="text-gray-700 body-font tails-selected-element bg-slate-900">
        <div className="container flex flex-col items-center px-8 py-8 mx-auto max-w-7xl sm:flex-row">
          <a
            href="#_"
            className="text-xl font-black leading-none text-gray-900 select-none logo"
          >
            tails<span className="text-indigo-600">.</span>
          </a>
          <p className="mt-4 text-sm text-gray-500 sm:ml-4 sm:pl-4 sm:border-l sm:border-gray-200 sm:mt-0">
            © 2021 Tails - Tailwindcss Page Builder
          </p>
          <span className="inline-flex justify-center mt-4 space-x-5 sm:ml-auto sm:mt-0 sm:justify-start">
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Facebook</span>
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
                data-darkreader-inline-fill=""
              >
                <path
                  fill-rule="evenodd"
                  d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </a>

            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Instagram</span>
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
                data-darkreader-inline-fill=""
              >
                <path
                  fill-rule="evenodd"
                  d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </a>

            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Twitter</span>
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
                data-darkreader-inline-fill=""
              >
                <path
                  d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"
                  className=""
                ></path>
              </svg>
            </a>

            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">GitHub</span>
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
                data-darkreader-inline-fill=""
              >
                <path
                  fill-rule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </a>

            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Dribbble</span>
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
                data-darkreader-inline-fill=""
              >
                <path
                  fill-rule="evenodd"
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </a>
          </span>
        </div>
      </section>
    </main>
  );
}
