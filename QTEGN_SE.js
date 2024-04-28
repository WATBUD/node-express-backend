const database = {
  products: {
    "001": {
      name: "Cola",
      price: 45,
    },
    "002": {
      name: "Royal",
      price: 50,
    },
    "003": {
      name: "Sprite",
      price: 55,
    },
    "004": {
      name: "Fanta",
      price: 60,
    },
    "005": {
      name: "Lemon Tea",
      price: 35,
    },
  },
};

const toItem = (productId, id) => {
  const product = database.products[productId];

  if (!product) {
    throw new Error("Product not found");
  }

  return {
    id,
    productId,
    name: product.name,
    price: product.price,
    discounts: [],
  };
};

const discountSum = (discounts) =>
  discounts.reduce((acc, discount) => acc + discount.amount, 0);

const ruleOne = (items, frequency) => {
  const recordForProduct = new Map();
  const newItems = []; // Initialize newItems array

  items.map((item) => {
    const record = recordForProduct.get(item.productId) || {
      count: 0,
      itemIds: [],
    };
    let newItem = item;
    if (record.count + 1 === frequency) {
      const itemDiscountAmount = discountSum(item.discounts);
      newItem = {
        ...item,
        discounts: [
          ...item.discounts,
          {
            type: "ruleOne",
            amount: Math.min(item.price - itemDiscountAmount, item.price / 2),
          },
        ],
      };

      // appily discount to previous items
      record.itemIds.forEach((id) => {
        newItems[id] = {
          ...newItems[id],
          discounts: [
            ...newItems[id].discounts,
            {
              type: "ruleOne",
              amount: 0,
            },
          ],
        };
      });

      // clear record
      recordForProduct.set(item.productId, {
        count: 0,
        itemIds: [],
      });
    } else {
      recordForProduct.set(item.productId, {
        count: record.count + 1,
        itemIds: [...record.itemIds, item.id],
      });
    }
    newItems.push(newItem); // Push newItem into newItems array
  });

  return newItems;
};

const ruleTwo = (items) => {
  const newItems = items.map((item) => {
    if (item.discounts.length === 0) {
      return {
        ...item,
        discounts: [
          ...item.discounts,
          {
            type: "ruleTwo",
            amount: Math.min(5, item.price), // not has other discount
          },
        ],
      };
    }

    return item;
  });

  return newItems;
};

export const checkout = (productIDs = []) => {
  const items = productIDs.map(toItem);
  //console.log("items" + JSON.stringify(items));


  console.log("items\n" + JSON.stringify(items));


  const applyRules = [(i) => ruleOne(i, 2), ruleTwo];

  const newItems = applyRules.reduce((acc, rule) => rule(acc), items);

  console.log("newItems\n" + JSON.stringify(newItems));

  const total = newItems.reduce(
    (acc, item) => acc + item.price - discountSum(item.discounts),
    0
  );

  return total;
};




console.log("Your price is $" + checkout(["003", "002", "003", "003", "004"]));

// document.getElementById("app").innerHTML =
//   "Your price is $" + checkout(["003", "002", "003", "003", "004"]);
