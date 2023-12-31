// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import GDPRWebhookHandlers from "./gdpr.js";
import cors from "cors"


const CREATE_MEAL_PLAN_MUTATION = `
mutation CreateMealPlan($clientId: ID!, $mealPlanInput: MealPlanInput!) {
  createMealPlan(clientId: $clientId, mealPlan: $mealPlanInput) {
    id
    name
    startDate
    endDate
    days {
      dayOfWeek
      meals {
        breakfast
        lunch
        dinner
        snack
      }
    }
    errors {
      field
      message
    }
  }
}
`;


const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();
// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: GDPRWebhookHandlers })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());
app.use(cors())


const MealPlan = async (req, res ) => {
  try {
    const session = res.locals.shopify.session;
    const client = new shopify.api.clients.Graphql(session);
    console.log(client)
    // const data = await client.query({
    //   query: mutation,
    //   variables: req.body,
    // });

    // res.send(data.body);
  } catch (error) {
    // Handle errors here if needed
  
    res.status(400).json({ error: error });
  }
};
app.post("/api/meals/plan", MealPlan);


app.get("/api/products/count", async (_req, res) => {
  const countData = await shopify.api.rest.Product.count({
    session: res.locals.shopify.session,
  });
  res.status(200).send(countData);
});

app.get("/api/products/create", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT);