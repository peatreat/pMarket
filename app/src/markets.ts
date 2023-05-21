import { Dispatch, MutableRefObject, SetStateAction } from "react";
import * as globals from "./globals";

function shuffle(a: globals.Item[]) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}

async function update_csmoney(
  cursor: MutableRefObject<number>,
  query: {
    search: string;
    wears: any[];
    stattrak: any[];
    souvenir: any[];
    floats: any[];
    quality: any[];
    seeds: string[];
    phases: any[];
    stickers: any[];
    prices: any[];
    sort: number;
    order: number;
  }
) {
  if (cursor.current === -1) return [];

  const csmoney_wears = ["fn", "mw", "ft", "ww", "bs"] as const;

  const csmoney_sorts = ["price", "discount", "insertDate"] as const;

  const csmoney_order = ["desc", "asc"] as const;

  const filters = [
    ["limit", "60"],
    ["offset", cursor.current.toString()],
  ];

  filters.push(
    ...query.wears
      .filter((wear) => wear.selected)
      .map((_, i) => ["quality", csmoney_wears[i]])
  );

  filters.push(
    ...query.stattrak
      .filter((x) => x.selected)
      .map((stattrak) => [
        "isStatTrak",
        stattrak.type === "StatTrak" ? "true" : "false",
      ])
  );

  filters.push(
    ...query.souvenir
      .filter((x) => x.selected)
      .map((souvenir) => [
        "isSouvenir",
        souvenir.type === "Souvenir" ? "true" : "false",
      ])
  );

  filters.push(
    ...query.floats
      .filter((float) => float.value.length > 0)
      .map((float) => [
        float.type == "From" ? "minFloat" : "maxFloat",
        float.value,
      ])
  );

  filters.push(
    ...query.quality.filter((x) => x.selected).map((x) => ["rarity", x.type])
  );

  filters.push(...query.seeds.map((seed) => ["pattern", seed]));

  filters.push(
    ...query.phases
      .filter((phase) => phase.selected)
      .map((phase) => ["phase", phase.type])
  );

  let stickerCount = 1;
  filters.push(
    ...query.stickers.map((sticker) => [
      `stickerName${stickerCount++}`,
      "Sticker | " + sticker.name,
    ])
  );

  if (query.prices[0].value.length > 0)
    filters.push(["minPrice", query.prices[0].value]);

  if (query.prices[1].value.length > 0)
    filters.push(["maxPrice", query.prices[1].value]);

  if (query.search.length > 0) filters.push(["name", query.search]);

  if (query.sort > 0) {
    filters.push(["sort", csmoney_sorts[query.sort - 1]]);
    filters.push(["order", csmoney_order[query.order]]);
  }

  const resp =
    (await fetch(
      `https://cs.money/1.0/market/sell-orders?${new URLSearchParams(filters)}`,
      {
        method: "GET",
        headers: { origin: "https://cs.money/" },
      }
    ).catch((e) => {
      console.log("error:", e);
    })) || null; // cache revalidates after 10 seconds. for no cache: { cache: 'no-store' }

  if (!resp || !resp.ok) return [];

  const data = await resp.json();

  if (!data.items || data.items.length == 0) {
    cursor.current = -1;
    return [];
  }

  const items: globals.Item[] = [];

  for (let i = 0; i < data.items.length; i++) {
    items.push({
      Name: data.items[i].asset.names.full,
      Price: data.items[i].pricing.computed,
      Discount: data.items[i].pricing.discount,
      Image: data.items[i].asset.images.steam,
      Quality: data.items[i].asset.rarity.toLowerCase(),
      Stickers: data.items[i].stickers
        ? data.items[i].stickers
            .filter((sticker: null) => sticker != null)
            .map((sticker: { name: string; image: string }) => ({
              name: sticker.name,
              image: sticker.image,
            }))
        : [],
      Date: -1,
      Link:
        "https://cs.money/market/buy/?" +
        new URLSearchParams({
          search: data.items[i].asset.names.full,
          minFloat: data.items[i].asset.float,
          maxFloat: data.items[i].asset.float,
          minPrice: data.items[i].pricing.computed,
          maxPrice: data.items[i].pricing.computed,
        }),
    });
  }

  cursor.current += 60;
  return items;
}

async function update_dmarket(
  cursor: MutableRefObject<string>,
  query: {
    search: string;
    wears: any[];
    stattrak: any[];
    souvenir: any[];
    floats: any[];
    quality: any[];
    seeds: string[];
    phases: any[];
    stickers: any[];
    prices: any[];
    sort: number;
    order: number;
  }
) {
  console.log("searching with cursor", cursor.current);

  if (cursor.current === "0") return [];

  const filters = query.wears
    .filter((wear) => wear.selected)
    .map((wear) => `exterior[]=${wear.type.toLowerCase()}`);

  filters.push(
    ...query.stattrak
      .filter((x) => x.selected)
      .map(
        (x) =>
          `category_0[]=${
            x.type === "StatTrak" ? "stattrak_tm" : "not_stattrak_tm"
          }`
      )
  );

  filters.push(
    ...query.souvenir
      .filter((x) => x.selected)
      .map(
        (x) =>
          `category_1[]=${x.type === "Souvenir" ? "souvenir" : "not_souvenir"}`
      )
  );

  filters.push(
    ...query.floats
      .filter((float) => float.value.length > 0)
      .map(
        (float) =>
          `${float.type == "From" ? "floatValueFrom[]=" : "floatValueTo[]="}${
            float.value
          }`
      )
  );

  filters.push(
    ...query.quality
      .filter((x) => x.selected)
      .map((x) => `quality[]=${x.type.toLowerCase()}`)
  );

  filters.push(...query.seeds.map((seed) => `paintSeed[]=${seed}`));

  filters.push(
    ...query.phases
      .filter((phase) => phase.selected)
      .map((phase) => `phase[]=${phase.type.toLowerCase().replace(" ", "-")}`)
  );

  filters.push(
    ...query.stickers.map((sticker) => `stickerNames[]=${sticker.name}`)
  );

  const filter_price = (price: string) => {
    if (price.length == 0) return price;

    if (price.includes(".")) return price.replace(".", "");

    return price + "00";
  };

  const dmarket_sorts = ["price", "best_discount", "updated"] as const;

  const dmarket_order = ["desc", "asc"] as const;

  const dmarket_query = {
    side: "market",
    orderBy: query.sort > 0 ? dmarket_sorts[query.sort - 1] : "personal",
    orderDir: dmarket_order[query.order],
    title: query.search,
    priceFrom: filter_price(query.prices[0].value) || "0",
    priceTo: filter_price(query.prices[1].value) || "0",
    gameId: "a8db",
    types: "dmarket",
    cursor: cursor.current,
    limit: "100",
    currency: "USD",
    platform: "browser",
    treeFilters: filters.join(","),
  };

  const resp =
    (await fetch(
      `https://api.dmarket.com/exchange/v1/market/items?${new URLSearchParams(
        dmarket_query
      )}`,
      { method: "GET" }
    ).catch((e) => {
      console.log("error:", e);
    })) || null; // cache revalidates after 10 seconds. for no cache: { cache: 'no-store' }

  if (!resp || !resp.ok) return [];

  const data = await resp.json();

  if (!data.objects || data.objects.length == 0) {
    cursor.current = "0";
    return [];
  }

  const items: globals.Item[] = [];

  for (let i = 0; i < data.objects.length; i++) {
    items.push({
      Name: data.objects[i].title,
      Price: parseInt(data.objects[i].price.USD) / 100,
      Discount: data.objects[i].discount / 100, // make discount 0-1
      Image: data.objects[i].image,
      Quality: data.objects[i].extra.quality,
      Stickers: data.objects[i].extra.stickers || [],
      Date: data.objects[i].createdAt,
      Link:
        "https://dmarket.com/ingame-items/item-list/csgo-skins?userOfferId=" +
        data.objects[i].extra.linkId,
    });
  }

  cursor.current = data.cursor ? data.cursor : "0";
  console.log("cursor set to", cursor.current);
  return items;
}

async function update_items(
  new_search: boolean,
  items: globals.Item[],
  setItems: Dispatch<SetStateAction<globals.Item[]>>,
  cursorDMarket: MutableRefObject<string>,
  cursorCsmoney: MutableRefObject<number>,
  query: {
    search: string;
    wears: any[];
    stattrak: any[];
    souvenir: any[];
    floats: any[];
    quality: any[];
    seeds: string[];
    phases: any[];
    stickers: any[];
    prices: any[];
    sort: number;
    order: number;
  }
) {
  if (new_search) {
    items = [];
    cursorCsmoney.current = 0;
    cursorDMarket.current = "";
  }

  const promises = [
    update_csmoney(cursorCsmoney, query),
    update_dmarket(cursorDMarket, query),
  ];

  const new_items = await Promise.all(promises); // change this to allSettled later

  let total_items = 0;
  for (let i = 0; i < new_items.length; i++) total_items += new_items[i].length;

  if (new_search && total_items == 0) {
    setItems([]);
    return;
  }

  if (query.sort === 0) {
    // default
    setItems(new_items.flat());
    return;
  }

  if (query.sort === 3) {
    // csmoney doesnt send creation date along so for now we are just going to join everything and shuffle
    setItems(shuffle(new_items.flat()));
    return;
  }

  const idxs = Array(new_items.length).fill(0);
  let sorting = true;

  do {
    let arrays_sorted = 0;
    let idx_to_use = 0;

    for (let i = 0; i < new_items.length; i++) {
      if (idxs[i] >= new_items[i].length) {
        arrays_sorted++;
        continue;
      }

      if (idx_to_use == i) continue;

      const desc = query.order === 0;

      if (idxs[idx_to_use] >= new_items[idx_to_use].length) {
        idx_to_use = i;
        continue;
      }

      switch (query.sort) {
        case 1: {
          // price
          const cur_price_higher =
            new_items[i][idxs[i]].Price >
            new_items[idx_to_use][idxs[idx_to_use]].Price;
          if ((desc && cur_price_higher) || (!desc && !cur_price_higher)) {
            // !(a^b) would be better but wont let me
            idx_to_use = i;
          }

          break;
        }
        case 2: {
          // discount
          const cur_discount_higher =
            new_items[i][idxs[i]].Discount >
            new_items[idx_to_use][idxs[idx_to_use]].Discount;
          if ((desc && cur_discount_higher) || (!desc && !cur_discount_higher))
            // !(a^b) would be better but wont let me
            idx_to_use = i;

          break;
        }
      }
    }

    if (arrays_sorted == new_items.length) break;

    items.push(new_items[idx_to_use][idxs[idx_to_use]]);

    idxs[idx_to_use]++;
  } while (sorting);

  setItems(items);
}

export { update_items };
