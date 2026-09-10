import React, { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext } from "react";
import {
  Home, Search, Heart, User, ArrowLeft, Plus, Minus, Clock, Users as UsersIcon,
  Flame, Check, ChevronRight, Moon, Sun, Send, Timer as TimerIcon, Scale, X,
  Loader2, Mail, Star, ChefHat, Sparkles, Bot, Pencil, RotateCcw, Play, Pause,
  Grid3x3, Cookie, Wheat, Cake, IceCream2,
} from "lucide-react";

/* =========================================================================
   CAKELAB — a baking companion
   Signature motif: the "dial" — a measuring-gauge ring used for progress,
   the timer, and category badges. Ties the app's two ideas together:
   a baker's precision ("lab") and a cake's round layers.
   ========================================================================= */

/* ---------------------------- Theme tokens ------------------------------ */

const THEME = {
  light: {
    bg: "#FBF7F1",
    surface: "#FFFFFF",
    surfaceAlt: "#F3EAE0",
    text: "#3A2A1E",
    textSoft: "#8A7361",
    accent: "#B98553",
    accentStrong: "#8C6239",
    accentSoft: "#EFE0CE",
    accentContrast: "#FFFFFF",
    border: "#E8DCCB",
    danger: "#B5584A",
    success: "#6B8F71",
  },
  dark: {
    bg: "#1E1814",
    surface: "#2A221D",
    surfaceAlt: "#342A23",
    text: "#F3EAE0",
    textSoft: "#C4B3A2",
    accent: "#D3A874",
    accentStrong: "#E8C89A",
    accentSoft: "#3D3128",
    accentContrast: "#241C16",
    border: "#463A31",
    danger: "#D98074",
    success: "#8FB596",
  },
};

const FONT_DISPLAY = "'Fraunces', ui-serif, Georgia, serif";
const FONT_BODY = "'Inter', ui-sans-serif, system-ui, sans-serif";
const FONT_MONO = "'JetBrains Mono', ui-monospace, monospace";

const ThemeCtx = createContext(THEME.light);
const useT = () => useContext(ThemeCtx);

/* ---------------------------- Storage hooks ------------------------------ */
/* Uses plain localStorage so this runs anywhere (not just inside a Claude
   artifact). Swap these two functions for real API calls (e.g. Supabase)
   when you're ready to sync data across devices. */

async function storageGet(key, fallback) {
  try {
    const raw = window.localStorage.getItem(`cakelab:${key}`);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}
async function storageSet(key, value) {
  try {
    window.localStorage.setItem(`cakelab:${key}`, JSON.stringify(value));
  } catch {
    /* ignore — non-fatal in preview */
  }
}

/* ------------------------------ Recipe data ------------------------------ */

const CATEGORIES = ["Cakes", "Cookies", "Bread", "Pastries", "Desserts"];

const CATEGORY_ICON = { Cakes: Cake, Cookies: Cookie, Bread: Wheat, Pastries: IceCream2, Desserts: IceCream2 };
const CATEGORY_TINT = {
  Cakes: "#E7B98C",
  Cookies: "#C99A66",
  Bread: "#D7C09A",
  Pastries: "#E3C7A6",
  Desserts: "#CBA07E",
};

function CategoryIcon({ category, ...props }) {
  const Icon = CATEGORY_ICON[category] || ChefHat;
  return <Icon {...props} />;
}

const RECIPES = [
  {
    id: "vanilla-sponge",
    name: "Classic Vanilla Sponge Cake",
    category: "Cakes",
    blurb: "Light, buttery layers with silky vanilla buttercream.",
    time: 75,
    difficulty: "Beginner",
    servings: 8,
    oven: 175,
    featured: true,
    tags: ["vanilla", "butter", "flour", "eggs", "milk", "classic", "buttercream"],
    ingredients: [
      { id: "i1", name: "All-purpose flour", amount: 280, unit: "g" },
      { id: "i2", name: "Granulated sugar", amount: 300, unit: "g" },
      { id: "i3", name: "Butter, softened", amount: 227, unit: "g" },
      { id: "i4", name: "large eggs", amount: 4, unit: null },
      { id: "i5", name: "Milk", amount: 180, unit: "ml" },
      { id: "i6", name: "Baking powder", amount: 2, unit: "tsp" },
      { id: "i7", name: "Vanilla extract", amount: 2, unit: "tsp" },
      { id: "i8", name: "Salt", amount: 1, unit: "pinch" },
    ],
    steps: [
      "Heat the oven to 175°C (350°F) and butter two 20cm round cake pans, lining the bases with parchment.",
      "Cream the butter and sugar together for 4–5 minutes until pale and fluffy.",
      "Beat in the eggs one at a time, then stir in the vanilla extract.",
      "Sift the flour, baking powder and salt over the batter and fold in gently, alternating with the milk.",
      "Divide between the pans and smooth the tops. Bake for 28–32 minutes until a skewer comes out clean.",
      "Cool in the pans for 10 minutes, then turn out onto a rack to cool fully before filling and frosting.",
    ],
  },
  {
    id: "choc-fudge-cake",
    name: "Rich Chocolate Fudge Cake",
    category: "Cakes",
    blurb: "Deep, dark and fudgy — a proper chocolate lover's cake.",
    time: 85,
    difficulty: "Intermediate",
    servings: 10,
    oven: 170,
    featured: true,
    tags: ["chocolate", "cocoa", "buttermilk", "coffee", "fudge"],
    ingredients: [
      { id: "i1", name: "All-purpose flour", amount: 250, unit: "g" },
      { id: "i2", name: "Cocoa powder", amount: 75, unit: "g" },
      { id: "i3", name: "Granulated sugar", amount: 350, unit: "g" },
      { id: "i4", name: "Buttermilk", amount: 240, unit: "ml" },
      { id: "i5", name: "Vegetable oil", amount: 120, unit: "ml" },
      { id: "i6", name: "large eggs", amount: 2, unit: null },
      { id: "i7", name: "Hot brewed coffee", amount: 180, unit: "ml" },
      { id: "i8", name: "Baking soda", amount: 1.5, unit: "tsp" },
    ],
    steps: [
      "Heat the oven to 170°C (340°F) and line two 20cm round pans.",
      "Whisk the flour, cocoa, sugar and baking soda together in a large bowl.",
      "Add the buttermilk, oil and eggs, and beat until smooth.",
      "Stir in the hot coffee last — the batter will be thin, that's correct.",
      "Divide between the pans and bake for 32–36 minutes until just set in the centre.",
      "Cool completely before layering with ganache or chocolate buttercream.",
    ],
  },
  {
    id: "lemon-drizzle",
    name: "Lemon Drizzle Cake",
    category: "Cakes",
    blurb: "A bright, tangy loaf cake soaked in lemon syrup.",
    time: 65,
    difficulty: "Beginner",
    servings: 8,
    oven: 170,
    featured: false,
    tags: ["lemon", "citrus", "loaf", "butter", "syrup"],
    ingredients: [
      { id: "i1", name: "All-purpose flour", amount: 200, unit: "g" },
      { id: "i2", name: "Granulated sugar", amount: 200, unit: "g" },
      { id: "i3", name: "Butter, softened", amount: 200, unit: "g" },
      { id: "i4", name: "large eggs", amount: 3, unit: null },
      { id: "i5", name: "lemons, zested and juiced", amount: 2, unit: null },
      { id: "i6", name: "Baking powder", amount: 1.5, unit: "tsp" },
      { id: "i7", name: "Powdered sugar (for drizzle)", amount: 100, unit: "g" },
    ],
    steps: [
      "Heat the oven to 170°C (340°F) and line a 900g loaf tin.",
      "Cream the butter, sugar and lemon zest until light and fluffy.",
      "Beat in the eggs one at a time, then fold in the flour and baking powder.",
      "Pour into the tin and bake for 45–50 minutes until a skewer comes out clean.",
      "Whisk the lemon juice with powdered sugar and spoon over the warm cake, letting it soak in.",
      "Cool in the tin before slicing.",
    ],
  },
  {
    id: "choc-chip-cookies",
    name: "Brown Butter Chocolate Chip Cookies",
    category: "Cookies",
    blurb: "Crisp edges, chewy centers, and a nutty brown-butter depth.",
    time: 40,
    difficulty: "Beginner",
    servings: 24,
    oven: 190,
    featured: true,
    tags: ["chocolate chips", "brown butter", "butter", "classic"],
    ingredients: [
      { id: "i1", name: "Butter", amount: 227, unit: "g" },
      { id: "i2", name: "Brown sugar (packed)", amount: 200, unit: "g" },
      { id: "i3", name: "Granulated sugar", amount: 100, unit: "g" },
      { id: "i4", name: "large eggs", amount: 2, unit: null },
      { id: "i5", name: "All-purpose flour", amount: 330, unit: "g" },
      { id: "i6", name: "Baking soda", amount: 1, unit: "tsp" },
      { id: "i7", name: "Chocolate chips", amount: 300, unit: "g" },
      { id: "i8", name: "Salt", amount: 1, unit: "tsp" },
    ],
    steps: [
      "Melt the butter in a light-colored pan until it foams, browns and smells nutty. Cool slightly.",
      "Whisk the browned butter with both sugars until glossy, then beat in the eggs.",
      "Stir in the flour, baking soda and salt until just combined, then fold in the chocolate chips.",
      "Chill the dough for at least 30 minutes — this keeps the cookies from spreading too thin.",
      "Heat the oven to 190°C (375°F). Scoop onto lined trays, spaced well apart.",
      "Bake for 10–12 minutes until the edges are set but the centers still look soft. Cool on the tray.",
    ],
  },
  {
    id: "oatmeal-raisin",
    name: "Chewy Oatmeal Raisin Cookies",
    category: "Cookies",
    blurb: "Warm spice, chewy oats and plump raisins in every bite.",
    time: 35,
    difficulty: "Beginner",
    servings: 20,
    oven: 180,
    featured: false,
    tags: ["oats", "raisins", "cinnamon", "butter"],
    ingredients: [
      { id: "i1", name: "Rolled oats", amount: 270, unit: "g" },
      { id: "i2", name: "All-purpose flour", amount: 150, unit: "g" },
      { id: "i3", name: "Butter, softened", amount: 170, unit: "g" },
      { id: "i4", name: "Brown sugar (packed)", amount: 200, unit: "g" },
      { id: "i5", name: "large eggs", amount: 1, unit: null },
      { id: "i6", name: "Raisins", amount: 150, unit: "g" },
      { id: "i7", name: "Ground cinnamon", amount: 1.5, unit: "tsp" },
      { id: "i8", name: "Baking soda", amount: 1, unit: "tsp" },
    ],
    steps: [
      "Heat the oven to 180°C (350°F) and line two baking trays.",
      "Cream the butter and brown sugar until fluffy, then beat in the egg.",
      "Stir in the flour, cinnamon and baking soda until combined.",
      "Fold in the oats and raisins by hand.",
      "Drop rounded spoonfuls onto the trays and flatten slightly.",
      "Bake for 11–13 minutes until golden at the edges. Cool on the tray for 5 minutes before moving.",
    ],
  },
  {
    id: "shortbread",
    name: "Classic Shortbread",
    category: "Cookies",
    blurb: "Three ingredients, one perfect buttery crumb.",
    time: 50,
    difficulty: "Beginner",
    servings: 16,
    oven: 160,
    featured: false,
    tags: ["butter", "flour", "sugar", "simple"],
    ingredients: [
      { id: "i1", name: "Butter, softened", amount: 227, unit: "g" },
      { id: "i2", name: "Powdered sugar", amount: 100, unit: "g" },
      { id: "i3", name: "All-purpose flour", amount: 300, unit: "g" },
      { id: "i4", name: "Salt", amount: 1, unit: "pinch" },
    ],
    steps: [
      "Heat the oven to 160°C (325°F) and line a baking tray or shortbread pan.",
      "Beat the butter and powdered sugar until smooth — avoid overbeating air into it.",
      "Mix in the flour and salt until the dough just comes together.",
      "Press into the pan or roll to 1cm thick and cut into fingers.",
      "Prick each piece with a fork and chill for 15 minutes.",
      "Bake for 20–25 minutes until pale gold. Cool completely before separating.",
    ],
  },
  {
    id: "sourdough",
    name: "Rustic Sourdough Loaf",
    category: "Bread",
    blurb: "A crackling crust and open, tangy crumb from a natural starter.",
    time: 1440,
    difficulty: "Advanced",
    servings: 12,
    oven: 230,
    featured: true,
    tags: ["starter", "flour", "levain", "crusty"],
    ingredients: [
      { id: "i1", name: "Bread flour", amount: 500, unit: "g" },
      { id: "i2", name: "Water", amount: 350, unit: "ml" },
      { id: "i3", name: "Active sourdough starter", amount: 100, unit: "g" },
      { id: "i4", name: "Salt", amount: 10, unit: "g" },
    ],
    steps: [
      "Mix the flour and water and rest for 30 minutes (autolyse).",
      "Add the starter and salt, then mix until incorporated.",
      "Perform 4 sets of stretch-and-folds over the next 2 hours, resting 30 minutes between each.",
      "Bulk ferment at room temperature for 4–6 hours until visibly puffy.",
      "Shape into a round, place in a floured banneton, and refrigerate overnight.",
      "Bake in a preheated Dutch oven at 230°C (450°F), lid on for 20 minutes, then lid off for 20–25 minutes until deep brown.",
    ],
  },
  {
    id: "focaccia",
    name: "Rosemary Focaccia",
    category: "Bread",
    blurb: "Pillowy, olive-oil-dimpled bread with crisp golden edges.",
    time: 180,
    difficulty: "Intermediate",
    servings: 10,
    oven: 220,
    featured: false,
    tags: ["olive oil", "rosemary", "yeast", "flatbread"],
    ingredients: [
      { id: "i1", name: "Bread flour", amount: 500, unit: "g" },
      { id: "i2", name: "Water, lukewarm", amount: 375, unit: "ml" },
      { id: "i3", name: "Olive oil", amount: 60, unit: "ml" },
      { id: "i4", name: "Instant yeast", amount: 2, unit: "tsp" },
      { id: "i5", name: "Salt", amount: 10, unit: "g" },
      { id: "i6", name: "Fresh rosemary", amount: 2, unit: "tbsp" },
      { id: "i7", name: "Flaky sea salt (to finish)", amount: 1, unit: "tsp" },
    ],
    steps: [
      "Mix the flour, water, yeast and salt into a shaggy, wet dough. Cover and rest 10 minutes.",
      "Drizzle in half the olive oil and knead briefly in the bowl until smooth.",
      "Cover and let rise for 1.5–2 hours until doubled.",
      "Pour the remaining oil into a baking tray, tip in the dough and stretch to fill the tray.",
      "Dimple all over with your fingertips, scatter with rosemary and flaky salt, and rest 20 minutes.",
      "Bake at 220°C (425°F) for 20–25 minutes until deep golden.",
    ],
  },
  {
    id: "croissants",
    name: "Buttery Croissants",
    category: "Pastries",
    blurb: "Laminated dough, dozens of flaky layers, pure patience.",
    time: 720,
    difficulty: "Advanced",
    servings: 12,
    oven: 200,
    featured: true,
    tags: ["laminated", "butter", "yeast", "lamination"],
    ingredients: [
      { id: "i1", name: "Bread flour", amount: 500, unit: "g" },
      { id: "i2", name: "Milk, cold", amount: 300, unit: "ml" },
      { id: "i3", name: "Granulated sugar", amount: 55, unit: "g" },
      { id: "i4", name: "Instant yeast", amount: 2, unit: "tsp" },
      { id: "i5", name: "Salt", amount: 10, unit: "g" },
      { id: "i6", name: "Butter block, for laminating", amount: 250, unit: "g" },
      { id: "i7", name: "large egg (for egg wash)", amount: 1, unit: null },
    ],
    steps: [
      "Mix the dough ingredients (except the butter block) and knead until smooth. Chill 1 hour.",
      "Roll the dough into a rectangle and encase the cold butter block.",
      "Perform 3 letter-folds, chilling 30–45 minutes between each.",
      "Roll the laminated dough to 4mm thick and cut into long triangles.",
      "Roll each triangle from base to tip into a crescent, then proof for 2–3 hours until jiggly.",
      "Brush with egg wash and bake at 200°C (400°F) for 16–20 minutes until deep golden and flaky.",
    ],
  },
  {
    id: "cinnamon-rolls",
    name: "Cinnamon Rolls",
    category: "Pastries",
    blurb: "Soft, spiraled rolls with brown sugar filling and cream cheese glaze.",
    time: 150,
    difficulty: "Intermediate",
    servings: 12,
    oven: 180,
    featured: true,
    tags: ["cinnamon", "yeast", "brown sugar", "cream cheese"],
    ingredients: [
      { id: "i1", name: "All-purpose flour", amount: 500, unit: "g" },
      { id: "i2", name: "Milk, warm", amount: 240, unit: "ml" },
      { id: "i3", name: "Butter, softened", amount: 85, unit: "g" },
      { id: "i4", name: "Instant yeast", amount: 2.25, unit: "tsp" },
      { id: "i5", name: "Brown sugar (packed, for filling)", amount: 150, unit: "g" },
      { id: "i6", name: "Ground cinnamon", amount: 2, unit: "tbsp" },
      { id: "i7", name: "Cream cheese, softened", amount: 115, unit: "g" },
      { id: "i8", name: "Powdered sugar", amount: 150, unit: "g" },
    ],
    steps: [
      "Mix the flour, milk, softened butter and yeast into a soft dough. Knead until smooth and elastic.",
      "Cover and let rise for 1 hour until doubled.",
      "Roll into a large rectangle and spread with softened butter, brown sugar and cinnamon.",
      "Roll up tightly into a log and slice into 12 rounds. Arrange in a baking dish and proof 30–40 minutes.",
      "Bake at 180°C (350°F) for 22–26 minutes until golden.",
      "Beat the cream cheese with powdered sugar and a splash of milk, then spread over the warm rolls.",
    ],
  },
  {
    id: "apple-turnovers",
    name: "Apple Turnovers",
    category: "Pastries",
    blurb: "Flaky puff pastry parcels with warm spiced apple filling.",
    time: 60,
    difficulty: "Beginner",
    servings: 8,
    oven: 200,
    featured: false,
    tags: ["puff pastry", "apple", "cinnamon", "quick"],
    ingredients: [
      { id: "i1", name: "Puff pastry sheets", amount: 2, unit: null },
      { id: "i2", name: "apples, peeled and diced", amount: 3, unit: null },
      { id: "i3", name: "Brown sugar (packed)", amount: 60, unit: "g" },
      { id: "i4", name: "Ground cinnamon", amount: 1, unit: "tsp" },
      { id: "i5", name: "Butter", amount: 15, unit: "g" },
      { id: "i6", name: "large egg (for egg wash)", amount: 1, unit: null },
    ],
    steps: [
      "Cook the apples, brown sugar, cinnamon and butter in a pan until softened, about 8 minutes. Cool.",
      "Heat the oven to 200°C (400°F) and cut the pastry into squares.",
      "Spoon the apple filling onto one half of each square, leaving a border.",
      "Fold into triangles and crimp the edges with a fork to seal.",
      "Brush with egg wash and cut two small slits on top for steam to escape.",
      "Bake for 18–22 minutes until puffed and golden.",
    ],
  },
  {
    id: "eclairs",
    name: "Chocolate Éclairs",
    category: "Pastries",
    blurb: "Choux pastry piped, baked crisp, and filled with vanilla cream.",
    time: 90,
    difficulty: "Advanced",
    servings: 10,
    oven: 200,
    featured: false,
    tags: ["choux pastry", "cream", "chocolate", "piping"],
    ingredients: [
      { id: "i1", name: "Water", amount: 250, unit: "ml" },
      { id: "i2", name: "Butter", amount: 100, unit: "g" },
      { id: "i3", name: "All-purpose flour", amount: 150, unit: "g" },
      { id: "i4", name: "large eggs", amount: 4, unit: null },
      { id: "i5", name: "Heavy cream, whipped, for filling", amount: 300, unit: "ml" },
      { id: "i6", name: "Dark chocolate, melted, for glaze", amount: 150, unit: "g" },
    ],
    steps: [
      "Bring the water and butter to a boil, then tip in the flour all at once and beat over heat until it forms a smooth ball.",
      "Cool slightly, then beat in the eggs one at a time until glossy and pipeable.",
      "Pipe into finger lengths on a lined tray and bake at 200°C (400°F) for 25–30 minutes until deeply golden and hollow.",
      "Cool completely, then pierce and pipe in the whipped cream — or split and fill.",
      "Dip the tops in melted chocolate and let set before serving.",
    ],
  },
  {
    id: "tiramisu",
    name: "Tiramisu",
    category: "Desserts",
    blurb: "Espresso-soaked layers of mascarpone, no baking required.",
    time: 40,
    difficulty: "Beginner",
    servings: 8,
    oven: null,
    featured: true,
    tags: ["mascarpone", "coffee", "no-bake", "ladyfingers"],
    ingredients: [
      { id: "i1", name: "Mascarpone", amount: 500, unit: "g" },
      { id: "i2", name: "large eggs, separated", amount: 4, unit: null },
      { id: "i3", name: "Granulated sugar", amount: 100, unit: "g" },
      { id: "i4", name: "Ladyfinger biscuits", amount: 24, unit: null },
      { id: "i5", name: "Strong brewed coffee, cooled", amount: 350, unit: "ml" },
      { id: "i6", name: "Cocoa powder, for dusting", amount: 2, unit: "tbsp" },
    ],
    steps: [
      "Whisk the egg yolks with sugar until pale, then fold in the mascarpone until smooth.",
      "Whip the egg whites to soft peaks and fold gently into the mascarpone mixture.",
      "Dip each ladyfinger briefly in coffee and layer in a dish.",
      "Spread half the mascarpone cream over, then repeat with another layer of dipped biscuits and cream.",
      "Dust generously with cocoa powder and chill for at least 4 hours, ideally overnight.",
    ],
  },
  {
    id: "creme-brulee",
    name: "Crème Brûlée",
    category: "Desserts",
    blurb: "Silky vanilla custard under a shatteringly crisp sugar shell.",
    time: 60,
    difficulty: "Intermediate",
    servings: 6,
    oven: 150,
    featured: false,
    tags: ["custard", "vanilla", "cream", "torch"],
    ingredients: [
      { id: "i1", name: "Heavy cream", amount: 500, unit: "ml" },
      { id: "i2", name: "Vanilla bean pod, split, or 2 tsp extract", amount: 1, unit: null },
      { id: "i3", name: "large egg yolks", amount: 6, unit: null },
      { id: "i4", name: "Granulated sugar", amount: 80, unit: "g" },
      { id: "i5", name: "Granulated sugar, for the topping", amount: 6, unit: "tbsp" },
    ],
    steps: [
      "Heat the oven to 150°C (300°F). Warm the cream with the vanilla until just steaming.",
      "Whisk the egg yolks and sugar together, then slowly pour in the warm cream, whisking constantly.",
      "Strain into ramekins and place in a deep baking tray filled with hot water halfway up the sides.",
      "Bake for 35–40 minutes until just set with a slight wobble in the center.",
      "Chill for at least 2 hours. Before serving, sprinkle sugar on top and caramelize with a kitchen torch or under a hot broiler.",
    ],
  },
  {
    id: "panna-cotta",
    name: "Vanilla Bean Panna Cotta",
    category: "Desserts",
    blurb: "A gently set, creamy Italian dessert with barely-there sweetness.",
    time: 20,
    difficulty: "Beginner",
    servings: 6,
    oven: null,
    featured: false,
    tags: ["cream", "gelatin", "no-bake", "vanilla"],
    ingredients: [
      { id: "i1", name: "Heavy cream", amount: 480, unit: "ml" },
      { id: "i2", name: "Milk", amount: 120, unit: "ml" },
      { id: "i3", name: "Granulated sugar", amount: 65, unit: "g" },
      { id: "i4", name: "Powdered gelatin", amount: 2.5, unit: "tsp" },
      { id: "i5", name: "Vanilla bean pod, split, or 1 tbsp extract", amount: 1, unit: null },
    ],
    steps: [
      "Sprinkle the gelatin over 3 tablespoons of cold water and let bloom for 5 minutes.",
      "Warm the cream, milk, sugar and vanilla in a saucepan until the sugar dissolves — do not boil.",
      "Remove from heat and whisk in the bloomed gelatin until fully dissolved.",
      "Strain into molds or glasses and chill for at least 4 hours until set.",
      "Unmold onto plates, or serve straight from the glass with fruit or a fruit coulis.",
    ],
  },

  /* ---- Cakes ---- */
  {
    id: "carrot-cake",
    name: "Carrot Cake",
    category: "Cakes",
    blurb: "Warmly spiced, moist layers under a tangy cream cheese frosting.",
    time: 80,
    difficulty: "Intermediate",
    servings: 10,
    oven: 175,
    featured: false,
    tags: ["carrot", "cinnamon", "walnuts", "cream cheese", "spice"],
    ingredients: [
      { id: "i1", name: "All-purpose flour", amount: 260, unit: "g" },
      { id: "i2", name: "Granulated sugar", amount: 300, unit: "g" },
      { id: "i3", name: "Vegetable oil", amount: 240, unit: "ml" },
      { id: "i4", name: "large eggs", amount: 3, unit: null },
      { id: "i5", name: "Carrots, finely grated", amount: 300, unit: "g" },
      { id: "i6", name: "Ground cinnamon", amount: 2, unit: "tsp" },
      { id: "i7", name: "Baking soda", amount: 1, unit: "tsp" },
      { id: "i8", name: "Cream cheese, softened, for frosting", amount: 225, unit: "g" },
    ],
    steps: [
      "Heat the oven to 175°C (350°F) and line two 20cm round pans.",
      "Whisk the oil, sugar and eggs together until smooth.",
      "Stir in the flour, cinnamon and baking soda, then fold in the grated carrots.",
      "Divide between the pans and bake for 32–36 minutes until a skewer comes out clean.",
      "Cool completely, then beat the cream cheese with powdered sugar and butter for the frosting.",
      "Frost between the layers and over the top; scatter with chopped walnuts if you like.",
    ],
  },
  {
    id: "red-velvet",
    name: "Red Velvet Cake",
    category: "Cakes",
    blurb: "A hint of cocoa, a buttermilk crumb, and classic cream cheese frosting.",
    time: 85,
    difficulty: "Intermediate",
    servings: 10,
    oven: 175,
    featured: false,
    tags: ["cocoa", "buttermilk", "red food coloring", "cream cheese"],
    ingredients: [
      { id: "i1", name: "All-purpose flour", amount: 300, unit: "g" },
      { id: "i2", name: "Granulated sugar", amount: 300, unit: "g" },
      { id: "i3", name: "Vegetable oil", amount: 240, unit: "ml" },
      { id: "i4", name: "Buttermilk", amount: 240, unit: "ml" },
      { id: "i5", name: "large eggs", amount: 2, unit: null },
      { id: "i6", name: "Cocoa powder", amount: 15, unit: "g" },
      { id: "i7", name: "Red food coloring", amount: 1, unit: "tbsp" },
      { id: "i8", name: "White vinegar", amount: 1, unit: "tsp" },
    ],
    steps: [
      "Heat the oven to 175°C (350°F) and line two 20cm round pans.",
      "Whisk the oil, sugar and eggs, then beat in the food coloring and vinegar.",
      "Sift in the flour and cocoa, alternating with the buttermilk, and mix until smooth.",
      "Divide between the pans and bake for 28–32 minutes until a skewer comes out clean.",
      "Cool completely before layering with cream cheese frosting.",
    ],
  },
  {
    id: "victoria-sponge",
    name: "Victoria Sponge",
    category: "Cakes",
    blurb: "The quintessential English teatime cake — jam, cream, simplicity.",
    time: 55,
    difficulty: "Beginner",
    servings: 8,
    oven: 180,
    featured: false,
    tags: ["butter", "jam", "cream", "classic", "eggs"],
    ingredients: [
      { id: "i1", name: "Butter, softened", amount: 225, unit: "g" },
      { id: "i2", name: "Granulated sugar", amount: 225, unit: "g" },
      { id: "i3", name: "large eggs", amount: 4, unit: null },
      { id: "i4", name: "Self-raising flour", amount: 225, unit: "g" },
      { id: "i5", name: "Strawberry jam", amount: 4, unit: "tbsp" },
      { id: "i6", name: "Heavy cream, whipped", amount: 200, unit: "ml" },
    ],
    steps: [
      "Heat the oven to 180°C (350°F) and line two 18cm round pans.",
      "Cream the butter and sugar until pale and fluffy, then beat in the eggs one at a time.",
      "Fold in the flour gently until just combined.",
      "Divide between the pans and bake for 20–25 minutes until golden and springy.",
      "Cool completely, then sandwich together with jam and whipped cream.",
    ],
  },
  {
    id: "marble-cake",
    name: "Marble Cake",
    category: "Cakes",
    blurb: "Swirled vanilla and chocolate batter for a striking slice every time.",
    time: 70,
    difficulty: "Beginner",
    servings: 10,
    oven: 175,
    featured: false,
    tags: ["chocolate", "vanilla", "swirl", "loaf"],
    ingredients: [
      { id: "i1", name: "All-purpose flour", amount: 300, unit: "g" },
      { id: "i2", name: "Granulated sugar", amount: 250, unit: "g" },
      { id: "i3", name: "Butter, softened", amount: 200, unit: "g" },
      { id: "i4", name: "large eggs", amount: 4, unit: null },
      { id: "i5", name: "Milk", amount: 100, unit: "ml" },
      { id: "i6", name: "Cocoa powder", amount: 30, unit: "g" },
      { id: "i7", name: "Baking powder", amount: 2, unit: "tsp" },
    ],
    steps: [
      "Heat the oven to 175°C (350°F) and butter a bundt or loaf tin.",
      "Cream the butter and sugar, then beat in the eggs and milk alternately with the flour and baking powder.",
      "Split the batter in half and stir cocoa powder into one portion.",
      "Spoon the two batters into the tin in alternating dollops, then swirl gently with a knife.",
      "Bake for 45–50 minutes until a skewer comes out clean. Cool before slicing.",
    ],
  },
  {
    id: "pineapple-upside-down",
    name: "Pineapple Upside-Down Cake",
    category: "Cakes",
    blurb: "Caramelized pineapple rings baked under a buttery vanilla cake.",
    time: 65,
    difficulty: "Beginner",
    servings: 8,
    oven: 175,
    featured: false,
    tags: ["pineapple", "brown sugar", "caramel", "retro"],
    ingredients: [
      { id: "i1", name: "Butter", amount: 85, unit: "g" },
      { id: "i2", name: "Brown sugar (packed)", amount: 150, unit: "g" },
      { id: "i3", name: "Pineapple rings", amount: 8, unit: null },
      { id: "i4", name: "All-purpose flour", amount: 200, unit: "g" },
      { id: "i5", name: "Granulated sugar", amount: 150, unit: "g" },
      { id: "i6", name: "large eggs", amount: 2, unit: null },
      { id: "i7", name: "Milk", amount: 120, unit: "ml" },
      { id: "i8", name: "Baking powder", amount: 1.5, unit: "tsp" },
    ],
    steps: [
      "Heat the oven to 175°C (350°F). Melt the butter with brown sugar in a round cake pan over low heat.",
      "Arrange the pineapple rings over the caramel in the pan.",
      "Beat the sugar, remaining butter and eggs until fluffy, then fold in the flour and baking powder alternately with the milk.",
      "Pour the batter over the pineapple and smooth the top.",
      "Bake for 35–40 minutes until a skewer comes out clean.",
      "Cool for 10 minutes, then invert onto a plate while still warm.",
    ],
  },
  {
    id: "coffee-walnut",
    name: "Coffee Walnut Cake",
    category: "Cakes",
    blurb: "Espresso-laced sponge with a crunch of toasted walnut.",
    time: 60,
    difficulty: "Beginner",
    servings: 8,
    oven: 175,
    featured: false,
    tags: ["coffee", "walnuts", "butter", "frosting"],
    ingredients: [
      { id: "i1", name: "Butter, softened", amount: 200, unit: "g" },
      { id: "i2", name: "Granulated sugar", amount: 200, unit: "g" },
      { id: "i3", name: "large eggs", amount: 3, unit: null },
      { id: "i4", name: "Self-raising flour", amount: 200, unit: "g" },
      { id: "i5", name: "Espresso, cooled", amount: 3, unit: "tbsp" },
      { id: "i6", name: "Walnuts, chopped", amount: 80, unit: "g" },
    ],
    steps: [
      "Heat the oven to 175°C (350°F) and line two 18cm pans.",
      "Cream the butter and sugar, then beat in the eggs and espresso.",
      "Fold in the flour and half the walnuts.",
      "Divide between the pans and bake for 22–25 minutes until springy.",
      "Cool, then sandwich and cover with coffee buttercream, and top with the remaining walnuts.",
    ],
  },

  /* ---- Cookies ---- */
  {
    id: "peanut-butter-cookies",
    name: "Peanut Butter Cookies",
    category: "Cookies",
    blurb: "Rich, nutty and tender with the classic fork-crosshatch top.",
    time: 30,
    difficulty: "Beginner",
    servings: 20,
    oven: 175,
    featured: false,
    tags: ["peanut butter", "butter", "classic"],
    ingredients: [
      { id: "i1", name: "Creamy peanut butter", amount: 260, unit: "g" },
      { id: "i2", name: "Butter, softened", amount: 115, unit: "g" },
      { id: "i3", name: "Brown sugar (packed)", amount: 130, unit: "g" },
      { id: "i4", name: "Granulated sugar", amount: 100, unit: "g" },
      { id: "i5", name: "large eggs", amount: 1, unit: null },
      { id: "i6", name: "All-purpose flour", amount: 150, unit: "g" },
      { id: "i7", name: "Baking soda", amount: 1, unit: "tsp" },
    ],
    steps: [
      "Heat the oven to 175°C (350°F) and line two baking trays.",
      "Beat the peanut butter, butter and both sugars until smooth, then beat in the egg.",
      "Stir in the flour and baking soda until just combined.",
      "Roll into balls, place on the trays, and press a criss-cross pattern with a fork.",
      "Bake for 10–12 minutes until set at the edges. Cool on the tray.",
    ],
  },
  {
    id: "snickerdoodles",
    name: "Snickerdoodles",
    category: "Cookies",
    blurb: "Soft, chewy sugar cookies rolled in cinnamon sugar.",
    time: 30,
    difficulty: "Beginner",
    servings: 24,
    oven: 190,
    featured: false,
    tags: ["cinnamon", "sugar", "butter", "cream of tartar"],
    ingredients: [
      { id: "i1", name: "Butter, softened", amount: 227, unit: "g" },
      { id: "i2", name: "Granulated sugar", amount: 300, unit: "g" },
      { id: "i3", name: "large eggs", amount: 2, unit: null },
      { id: "i4", name: "All-purpose flour", amount: 340, unit: "g" },
      { id: "i5", name: "Cream of tartar", amount: 2, unit: "tsp" },
      { id: "i6", name: "Baking soda", amount: 1, unit: "tsp" },
      { id: "i7", name: "Ground cinnamon, for rolling", amount: 2, unit: "tbsp" },
    ],
    steps: [
      "Heat the oven to 190°C (375°F) and line two baking trays.",
      "Cream the butter and sugar, then beat in the eggs.",
      "Mix in the flour, cream of tartar and baking soda until a soft dough forms.",
      "Roll into balls and coat in cinnamon sugar.",
      "Space on the trays and bake for 9–11 minutes until just set — they'll look slightly underdone.",
      "Cool on the tray; the crackled tops firm up as they cool.",
    ],
  },
  {
    id: "gingerbread-cookies",
    name: "Gingerbread Cookies",
    category: "Cookies",
    blurb: "Spiced, crisp cut-out cookies perfect for decorating.",
    time: 50,
    difficulty: "Beginner",
    servings: 24,
    oven: 175,
    featured: false,
    tags: ["ginger", "molasses", "spice", "holiday"],
    ingredients: [
      { id: "i1", name: "All-purpose flour", amount: 480, unit: "g" },
      { id: "i2", name: "Butter, softened", amount: 170, unit: "g" },
      { id: "i3", name: "Brown sugar (packed)", amount: 150, unit: "g" },
      { id: "i4", name: "Molasses", amount: 180, unit: "ml" },
      { id: "i5", name: "large egg", amount: 1, unit: null },
      { id: "i6", name: "Ground ginger", amount: 2, unit: "tsp" },
      { id: "i7", name: "Ground cinnamon", amount: 1, unit: "tsp" },
      { id: "i8", name: "Baking soda", amount: 1, unit: "tsp" },
    ],
    steps: [
      "Cream the butter and brown sugar, then beat in the molasses and egg.",
      "Mix in the flour, spices and baking soda to form a firm dough. Chill 1 hour.",
      "Heat the oven to 175°C (350°F). Roll the dough to 5mm thick and cut into shapes.",
      "Bake for 9–11 minutes until just firm at the edges.",
      "Cool completely before decorating with royal icing.",
    ],
  },
  {
    id: "double-choc-cookies",
    name: "Double Chocolate Cookies",
    category: "Cookies",
    blurb: "Deeply chocolatey with pools of melted chocolate chunks.",
    time: 30,
    difficulty: "Beginner",
    servings: 20,
    oven: 190,
    featured: false,
    tags: ["chocolate", "cocoa", "chocolate chunks"],
    ingredients: [
      { id: "i1", name: "Butter, softened", amount: 170, unit: "g" },
      { id: "i2", name: "Brown sugar (packed)", amount: 200, unit: "g" },
      { id: "i3", name: "large eggs", amount: 2, unit: null },
      { id: "i4", name: "All-purpose flour", amount: 220, unit: "g" },
      { id: "i5", name: "Cocoa powder", amount: 60, unit: "g" },
      { id: "i6", name: "Baking soda", amount: 1, unit: "tsp" },
      { id: "i7", name: "Dark chocolate chunks", amount: 250, unit: "g" },
    ],
    steps: [
      "Heat the oven to 190°C (375°F) and line two baking trays.",
      "Cream the butter and sugar, then beat in the eggs.",
      "Stir in the flour, cocoa and baking soda until a thick dough forms.",
      "Fold in the chocolate chunks.",
      "Scoop onto the trays and bake for 10–11 minutes until just set. Cool on the tray.",
    ],
  },
  {
    id: "biscotti",
    name: "Almond Biscotti",
    category: "Cookies",
    blurb: "Twice-baked, crunchy Italian cookies perfect for dunking.",
    time: 70,
    difficulty: "Intermediate",
    servings: 24,
    oven: 175,
    featured: false,
    tags: ["almonds", "twice-baked", "coffee pairing"],
    ingredients: [
      { id: "i1", name: "All-purpose flour", amount: 300, unit: "g" },
      { id: "i2", name: "Granulated sugar", amount: 200, unit: "g" },
      { id: "i3", name: "large eggs", amount: 3, unit: null },
      { id: "i4", name: "Whole almonds", amount: 150, unit: "g" },
      { id: "i5", name: "Baking powder", amount: 1.5, unit: "tsp" },
      { id: "i6", name: "Vanilla extract", amount: 1, unit: "tsp" },
    ],
    steps: [
      "Heat the oven to 175°C (350°F) and line a baking tray.",
      "Whisk the eggs, sugar and vanilla, then stir in the flour, baking powder and almonds to form a dough.",
      "Shape into two logs on the tray and bake for 25 minutes until firm.",
      "Cool for 10 minutes, then slice diagonally into 1.5cm pieces.",
      "Lay the slices cut-side down and bake again for 10–12 minutes, flipping halfway, until dry and crisp.",
    ],
  },
  {
    id: "thumbprint-cookies",
    name: "Thumbprint Jam Cookies",
    category: "Cookies",
    blurb: "Buttery shortbread cookies with a jewel of jam in the center.",
    time: 35,
    difficulty: "Beginner",
    servings: 20,
    oven: 175,
    featured: false,
    tags: ["jam", "butter", "shortbread"],
    ingredients: [
      { id: "i1", name: "Butter, softened", amount: 227, unit: "g" },
      { id: "i2", name: "Granulated sugar", amount: 100, unit: "g" },
      { id: "i3", name: "large egg yolks", amount: 2, unit: null },
      { id: "i4", name: "All-purpose flour", amount: 280, unit: "g" },
      { id: "i5", name: "Raspberry jam", amount: 100, unit: "g" },
    ],
    steps: [
      "Heat the oven to 175°C (350°F) and line two baking trays.",
      "Cream the butter and sugar, then beat in the egg yolks.",
      "Mix in the flour until a soft dough forms.",
      "Roll into balls, space on the trays, and press a thumbprint into the center of each.",
      "Fill each indent with a little jam and bake for 14–16 minutes until lightly golden.",
    ],
  },

  /* ---- Bread ---- */
  {
    id: "banana-bread",
    name: "Banana Bread",
    category: "Bread",
    blurb: "A moist, comforting loaf built for using up ripe bananas.",
    time: 75,
    difficulty: "Beginner",
    servings: 10,
    oven: 175,
    featured: true,
    tags: ["banana", "loaf", "simple", "butter"],
    ingredients: [
      { id: "i1", name: "ripe bananas, mashed", amount: 3, unit: null },
      { id: "i2", name: "Butter, melted", amount: 115, unit: "g" },
      { id: "i3", name: "Brown sugar (packed)", amount: 150, unit: "g" },
      { id: "i4", name: "large egg", amount: 1, unit: null },
      { id: "i5", name: "All-purpose flour", amount: 240, unit: "g" },
      { id: "i6", name: "Baking soda", amount: 1, unit: "tsp" },
      { id: "i7", name: "Vanilla extract", amount: 1, unit: "tsp" },
    ],
    steps: [
      "Heat the oven to 175°C (350°F) and line a loaf tin.",
      "Mash the bananas, then stir in the melted butter, sugar, egg and vanilla.",
      "Fold in the flour and baking soda until just combined — don't overmix.",
      "Pour into the tin and bake for 50–55 minutes until a skewer comes out clean.",
      "Cool in the tin for 10 minutes before turning out.",
    ],
  },
  {
    id: "brioche",
    name: "Brioche",
    category: "Bread",
    blurb: "Rich, golden and buttery — the plush French enriched loaf.",
    time: 240,
    difficulty: "Advanced",
    servings: 12,
    oven: 180,
    featured: false,
    tags: ["butter", "yeast", "enriched", "eggs"],
    ingredients: [
      { id: "i1", name: "Bread flour", amount: 500, unit: "g" },
      { id: "i2", name: "large eggs", amount: 4, unit: null },
      { id: "i3", name: "Milk, warm", amount: 60, unit: "ml" },
      { id: "i4", name: "Granulated sugar", amount: 50, unit: "g" },
      { id: "i5", name: "Instant yeast", amount: 2, unit: "tsp" },
      { id: "i6", name: "Butter, softened", amount: 225, unit: "g" },
      { id: "i7", name: "Salt", amount: 10, unit: "g" },
    ],
    steps: [
      "Mix the flour, eggs, milk, sugar, yeast and salt into a shaggy dough, then knead 10 minutes.",
      "Add the butter a little at a time, kneading until fully incorporated and glossy.",
      "Cover and refrigerate for at least 4 hours, or overnight.",
      "Shape into a loaf or rolls and proof at room temperature for 2 hours until puffy.",
      "Brush with egg wash and bake at 180°C (350°F) for 25–30 minutes until deep golden.",
    ],
  },
  {
    id: "baguette",
    name: "Classic Baguette",
    category: "Bread",
    blurb: "Crackling crust, airy crumb — the archetypal French loaf.",
    time: 300,
    difficulty: "Advanced",
    servings: 4,
    oven: 240,
    featured: false,
    tags: ["yeast", "flour", "crusty", "lean dough"],
    ingredients: [
      { id: "i1", name: "Bread flour", amount: 500, unit: "g" },
      { id: "i2", name: "Water", amount: 350, unit: "ml" },
      { id: "i3", name: "Instant yeast", amount: 1, unit: "tsp" },
      { id: "i4", name: "Salt", amount: 10, unit: "g" },
    ],
    steps: [
      "Mix the flour, water and yeast, rest 20 minutes, then add the salt and knead until smooth.",
      "Bulk ferment for 2–3 hours, folding once or twice.",
      "Divide into 4 pieces and shape into long batons. Proof on a floured couche for 45 minutes.",
      "Heat the oven to 240°C (465°F) with a tray of water for steam.",
      "Score each loaf with diagonal slashes and bake for 20–25 minutes until deep golden and hollow-sounding.",
    ],
  },
  {
    id: "cornbread",
    name: "Skillet Cornbread",
    category: "Bread",
    blurb: "Slightly sweet, golden, and crisp-edged from a hot cast-iron pan.",
    time: 35,
    difficulty: "Beginner",
    servings: 8,
    oven: 220,
    featured: false,
    tags: ["cornmeal", "buttermilk", "quick bread"],
    ingredients: [
      { id: "i1", name: "Cornmeal", amount: 200, unit: "g" },
      { id: "i2", name: "All-purpose flour", amount: 120, unit: "g" },
      { id: "i3", name: "Buttermilk", amount: 300, unit: "ml" },
      { id: "i4", name: "large eggs", amount: 2, unit: null },
      { id: "i5", name: "Butter, melted", amount: 60, unit: "g" },
      { id: "i6", name: "Granulated sugar", amount: 50, unit: "g" },
      { id: "i7", name: "Baking powder", amount: 1, unit: "tbsp" },
    ],
    steps: [
      "Heat the oven to 220°C (425°F) with a cast-iron skillet inside to preheat.",
      "Whisk the cornmeal, flour, sugar and baking powder together.",
      "Stir in the buttermilk, eggs and melted butter until just combined.",
      "Carefully pour into the hot, buttered skillet — it should sizzle.",
      "Bake for 18–22 minutes until golden and a skewer comes out clean.",
    ],
  },
  {
    id: "naan",
    name: "Garlic Naan",
    category: "Bread",
    blurb: "Pillowy, blistered flatbread brushed with garlic butter.",
    time: 120,
    difficulty: "Intermediate",
    servings: 8,
    oven: 250,
    featured: false,
    tags: ["yeast", "yogurt", "flatbread", "garlic"],
    ingredients: [
      { id: "i1", name: "All-purpose flour", amount: 450, unit: "g" },
      { id: "i2", name: "Plain yogurt", amount: 150, unit: "g" },
      { id: "i3", name: "Water, warm", amount: 120, unit: "ml" },
      { id: "i4", name: "Instant yeast", amount: 2, unit: "tsp" },
      { id: "i5", name: "Butter, melted", amount: 40, unit: "g" },
      { id: "i6", name: "Garlic cloves, minced", amount: 3, unit: null },
    ],
    steps: [
      "Mix the flour, yogurt, water and yeast into a soft dough. Knead until smooth.",
      "Cover and let rise for 1–1.5 hours until doubled.",
      "Divide into 8 balls and roll each into a teardrop shape.",
      "Cook in a very hot dry skillet or griddle for 1–2 minutes per side until bubbled and charred in spots.",
      "Brush with garlic butter as they come off the heat.",
    ],
  },
  {
    id: "rye-bread",
    name: "Dark Rye Bread",
    category: "Bread",
    blurb: "Dense, earthy, and slightly sweet with molasses and caraway.",
    time: 240,
    difficulty: "Intermediate",
    servings: 12,
    oven: 190,
    featured: false,
    tags: ["rye flour", "caraway", "molasses", "yeast"],
    ingredients: [
      { id: "i1", name: "Rye flour", amount: 300, unit: "g" },
      { id: "i2", name: "Bread flour", amount: 200, unit: "g" },
      { id: "i3", name: "Water, warm", amount: 320, unit: "ml" },
      { id: "i4", name: "Molasses", amount: 30, unit: "g" },
      { id: "i5", name: "Instant yeast", amount: 2, unit: "tsp" },
      { id: "i6", name: "Caraway seeds", amount: 1, unit: "tbsp" },
      { id: "i7", name: "Salt", amount: 10, unit: "g" },
    ],
    steps: [
      "Mix the flours, water, molasses, yeast, caraway and salt into a dense dough. Knead 8–10 minutes.",
      "Cover and let rise for 1.5 hours until noticeably puffed.",
      "Shape into a loaf and proof for another 45 minutes.",
      "Heat the oven to 190°C (375°F) and bake for 40–45 minutes until deeply browned and hollow-sounding.",
      "Cool fully before slicing — rye needs time to set.",
    ],
  },

  /* ---- Pastries ---- */
  {
    id: "danish-pastry",
    name: "Danish Pastry",
    category: "Pastries",
    blurb: "Laminated dough with sweet cheese or fruit filling.",
    time: 480,
    difficulty: "Advanced",
    servings: 10,
    oven: 200,
    featured: false,
    tags: ["laminated", "butter", "fruit", "cream cheese"],
    ingredients: [
      { id: "i1", name: "Bread flour", amount: 500, unit: "g" },
      { id: "i2", name: "Milk, cold", amount: 250, unit: "ml" },
      { id: "i3", name: "Granulated sugar", amount: 60, unit: "g" },
      { id: "i4", name: "Instant yeast", amount: 2, unit: "tsp" },
      { id: "i5", name: "Butter block, for laminating", amount: 250, unit: "g" },
      { id: "i6", name: "Cream cheese, sweetened, for filling", amount: 200, unit: "g" },
    ],
    steps: [
      "Mix the dough ingredients and knead until smooth. Chill 1 hour.",
      "Laminate with the butter block using 3 letter-folds, chilling between each.",
      "Roll out and cut into squares, adding a spoonful of sweetened cream cheese to each center.",
      "Fold the corners in and proof for 1.5–2 hours until puffy.",
      "Bake at 200°C (400°F) for 16–18 minutes until golden and flaky.",
    ],
  },
  {
    id: "palmiers",
    name: "Palmiers",
    category: "Pastries",
    blurb: "Crisp, caramelized puff pastry hearts — just pastry and sugar.",
    time: 45,
    difficulty: "Beginner",
    servings: 16,
    oven: 200,
    featured: false,
    tags: ["puff pastry", "sugar", "quick", "caramelized"],
    ingredients: [
      { id: "i1", name: "Puff pastry sheet", amount: 1, unit: null },
      { id: "i2", name: "Granulated sugar", amount: 100, unit: "g" },
    ],
    steps: [
      "Heat the oven to 200°C (400°F) and line a baking tray.",
      "Sprinkle a work surface generously with sugar and roll the pastry over it, pressing sugar into both sides.",
      "Fold both long edges in to meet the center, then fold again to form a tight log.",
      "Slice into 1cm rounds and lay flat on the tray.",
      "Bake for 12–15 minutes, flipping halfway, until deeply caramelized.",
    ],
  },
  {
    id: "baklava",
    name: "Baklava",
    category: "Pastries",
    blurb: "Layers of crisp phyllo, spiced walnuts, and honey syrup.",
    time: 90,
    difficulty: "Intermediate",
    servings: 20,
    oven: 175,
    featured: false,
    tags: ["phyllo", "honey", "walnuts", "syrup"],
    ingredients: [
      { id: "i1", name: "Phyllo dough sheets", amount: 20, unit: null },
      { id: "i2", name: "Walnuts, finely chopped", amount: 400, unit: "g" },
      { id: "i3", name: "Butter, melted", amount: 200, unit: "g" },
      { id: "i4", name: "Ground cinnamon", amount: 1, unit: "tsp" },
      { id: "i5", name: "Honey", amount: 250, unit: "g" },
      { id: "i6", name: "Granulated sugar, for syrup", amount: 150, unit: "g" },
    ],
    steps: [
      "Heat the oven to 175°C (350°F) and butter a baking dish.",
      "Layer half the phyllo sheets in the dish, brushing each with melted butter.",
      "Mix the walnuts with cinnamon and spread over the phyllo, then layer the remaining sheets on top, buttering each.",
      "Cut into diamonds before baking, then bake for 40–45 minutes until golden.",
      "Simmer honey and sugar with a little water into a syrup and pour over the hot baklava immediately.",
    ],
  },
  {
    id: "cannoli",
    name: "Cannoli",
    category: "Pastries",
    blurb: "Crisp fried shells piped with sweetened ricotta cream.",
    time: 75,
    difficulty: "Advanced",
    servings: 12,
    oven: null,
    featured: false,
    tags: ["ricotta", "fried", "Italian", "no-bake filling"],
    ingredients: [
      { id: "i1", name: "All-purpose flour", amount: 250, unit: "g" },
      { id: "i2", name: "Butter, softened", amount: 30, unit: "g" },
      { id: "i3", name: "Marsala wine", amount: 80, unit: "ml" },
      { id: "i4", name: "Ricotta, strained", amount: 500, unit: "g" },
      { id: "i5", name: "Powdered sugar", amount: 150, unit: "g" },
      { id: "i6", name: "Mini chocolate chips", amount: 60, unit: "g" },
    ],
    steps: [
      "Mix the flour, butter and marsala into a firm dough. Rest 30 minutes.",
      "Roll thin, cut into circles, and wrap around cannoli tubes, sealing the edge with a little egg wash.",
      "Fry in oil at 175°C (350°F) until golden and blistered, about 2 minutes. Cool and remove the tubes.",
      "Beat the ricotta with powdered sugar until smooth, then fold in the chocolate chips.",
      "Pipe the filling into the shells just before serving so they stay crisp.",
    ],
  },
  {
    id: "profiteroles",
    name: "Profiteroles",
    category: "Pastries",
    blurb: "Choux puffs filled with cream and draped in chocolate sauce.",
    time: 60,
    difficulty: "Intermediate",
    servings: 12,
    oven: 200,
    featured: false,
    tags: ["choux pastry", "cream", "chocolate sauce"],
    ingredients: [
      { id: "i1", name: "Water", amount: 250, unit: "ml" },
      { id: "i2", name: "Butter", amount: 100, unit: "g" },
      { id: "i3", name: "All-purpose flour", amount: 150, unit: "g" },
      { id: "i4", name: "large eggs", amount: 4, unit: null },
      { id: "i5", name: "Heavy cream, whipped, for filling", amount: 300, unit: "ml" },
      { id: "i6", name: "Dark chocolate, for sauce", amount: 150, unit: "g" },
    ],
    steps: [
      "Bring the water and butter to a boil, add the flour all at once, and beat until a smooth ball forms.",
      "Cool slightly, then beat in the eggs one at a time until glossy.",
      "Pipe small mounds onto a lined tray and bake at 200°C (400°F) for 22–25 minutes until golden and hollow.",
      "Cool completely, then pierce and fill with whipped cream.",
      "Melt the chocolate with a splash of cream and pour over just before serving.",
    ],
  },
  {
    id: "scones",
    name: "Buttermilk Scones",
    category: "Pastries",
    blurb: "Tender, flaky scones ready for jam and clotted cream.",
    time: 35,
    difficulty: "Beginner",
    servings: 8,
    oven: 200,
    featured: true,
    tags: ["buttermilk", "butter", "quick", "tea time"],
    ingredients: [
      { id: "i1", name: "All-purpose flour", amount: 300, unit: "g" },
      { id: "i2", name: "Butter, cold, cubed", amount: 85, unit: "g" },
      { id: "i3", name: "Granulated sugar", amount: 50, unit: "g" },
      { id: "i4", name: "Buttermilk", amount: 150, unit: "ml" },
      { id: "i5", name: "Baking powder", amount: 1, unit: "tbsp" },
      { id: "i6", name: "Salt", amount: 1, unit: "pinch" },
    ],
    steps: [
      "Heat the oven to 200°C (400°F) and line a baking tray.",
      "Rub the cold butter into the flour, sugar, baking powder and salt until it looks like breadcrumbs.",
      "Stir in the buttermilk just until a shaggy dough comes together — don't overwork it.",
      "Pat into a 3cm-thick round and cut into wedges or rounds.",
      "Bake for 14–16 minutes until risen and golden on top.",
    ],
  },

  /* ---- Desserts ---- */
  {
    id: "cheesecake",
    name: "Classic New York Cheesecake",
    category: "Desserts",
    blurb: "Dense, creamy and rich with a buttery graham cracker crust.",
    time: 90,
    difficulty: "Intermediate",
    servings: 12,
    oven: 160,
    featured: true,
    tags: ["cream cheese", "graham crackers", "baked custard"],
    ingredients: [
      { id: "i1", name: "Graham crackers, crushed", amount: 200, unit: "g" },
      { id: "i2", name: "Butter, melted", amount: 90, unit: "g" },
      { id: "i3", name: "Cream cheese, softened", amount: 900, unit: "g" },
      { id: "i4", name: "Granulated sugar", amount: 250, unit: "g" },
      { id: "i5", name: "large eggs", amount: 4, unit: null },
      { id: "i6", name: "Sour cream", amount: 120, unit: "g" },
      { id: "i7", name: "Vanilla extract", amount: 1, unit: "tbsp" },
    ],
    steps: [
      "Heat the oven to 160°C (325°F). Mix the crushed crackers with melted butter and press into a springform pan.",
      "Beat the cream cheese and sugar until smooth, then beat in the eggs one at a time.",
      "Mix in the sour cream and vanilla, then pour over the crust.",
      "Bake in a water bath for 55–65 minutes until the edges are set but the center still jiggles slightly.",
      "Cool in the oven with the door ajar, then chill at least 4 hours before releasing the pan.",
    ],
  },
  {
    id: "chocolate-mousse",
    name: "Chocolate Mousse",
    category: "Desserts",
    blurb: "Airy, deeply chocolatey, and made with just a handful of ingredients.",
    time: 30,
    difficulty: "Intermediate",
    servings: 6,
    oven: null,
    featured: false,
    tags: ["chocolate", "eggs", "no-bake", "cream"],
    ingredients: [
      { id: "i1", name: "Dark chocolate, melted", amount: 200, unit: "g" },
      { id: "i2", name: "large eggs, separated", amount: 4, unit: null },
      { id: "i3", name: "Granulated sugar", amount: 40, unit: "g" },
      { id: "i4", name: "Heavy cream, whipped", amount: 200, unit: "ml" },
    ],
    steps: [
      "Whisk the egg yolks into the slightly cooled melted chocolate until smooth.",
      "Whip the egg whites with sugar to stiff peaks.",
      "Fold the whipped cream into the chocolate mixture, then gently fold in the egg whites in two batches.",
      "Divide into glasses and chill for at least 3 hours before serving.",
    ],
  },
  {
    id: "molten-lava-cake",
    name: "Molten Chocolate Lava Cake",
    category: "Desserts",
    blurb: "A tender chocolate cake with a warm, oozing center.",
    time: 25,
    difficulty: "Beginner",
    servings: 4,
    oven: 220,
    featured: true,
    tags: ["chocolate", "butter", "individual", "quick"],
    ingredients: [
      { id: "i1", name: "Dark chocolate", amount: 115, unit: "g" },
      { id: "i2", name: "Butter", amount: 115, unit: "g" },
      { id: "i3", name: "large eggs", amount: 2, unit: null },
      { id: "i4", name: "large egg yolks", amount: 2, unit: null },
      { id: "i5", name: "Granulated sugar", amount: 60, unit: "g" },
      { id: "i6", name: "All-purpose flour", amount: 30, unit: "g" },
    ],
    steps: [
      "Heat the oven to 220°C (425°F) and butter four ramekins.",
      "Melt the chocolate and butter together until smooth.",
      "Whisk the eggs, yolks and sugar until pale, then fold in the melted chocolate and flour.",
      "Divide between the ramekins and bake for 10–12 minutes until the sides are set but the center still wobbles slightly.",
      "Let rest 1 minute, then invert onto plates and serve immediately.",
    ],
  },
  {
    id: "pavlova",
    name: "Pavlova",
    category: "Desserts",
    blurb: "Crisp meringue shell, marshmallowy center, piled with fruit and cream.",
    time: 120,
    difficulty: "Intermediate",
    servings: 8,
    oven: 130,
    featured: false,
    tags: ["meringue", "cream", "fruit", "gluten-free"],
    ingredients: [
      { id: "i1", name: "large egg whites", amount: 6, unit: null },
      { id: "i2", name: "Granulated sugar", amount: 330, unit: "g" },
      { id: "i3", name: "Cornstarch", amount: 1, unit: "tbsp" },
      { id: "i4", name: "White vinegar", amount: 1, unit: "tsp" },
      { id: "i5", name: "Heavy cream, whipped", amount: 300, unit: "ml" },
      { id: "i6", name: "Mixed berries", amount: 300, unit: "g" },
    ],
    steps: [
      "Heat the oven to 130°C (265°F) and draw a 22cm circle on baking parchment.",
      "Whip the egg whites to soft peaks, then gradually add the sugar and whip to a stiff, glossy meringue.",
      "Fold in the cornstarch and vinegar, then mound onto the circle, building up the sides slightly.",
      "Bake for 75–90 minutes, then turn off the oven and let cool inside with the door ajar.",
      "Top with whipped cream and berries just before serving.",
    ],
  },
  {
    id: "key-lime-pie",
    name: "Key Lime Pie",
    category: "Desserts",
    blurb: "Bright, tangy custard in a buttery graham crust.",
    time: 50,
    difficulty: "Beginner",
    servings: 8,
    oven: 160,
    featured: false,
    tags: ["lime", "condensed milk", "graham crackers"],
    ingredients: [
      { id: "i1", name: "Graham crackers, crushed", amount: 180, unit: "g" },
      { id: "i2", name: "Butter, melted", amount: 80, unit: "g" },
      { id: "i3", name: "Sweetened condensed milk", amount: 400, unit: "g" },
      { id: "i4", name: "large egg yolks", amount: 4, unit: null },
      { id: "i5", name: "Lime juice", amount: 120, unit: "ml" },
    ],
    steps: [
      "Heat the oven to 160°C (325°F). Mix the crackers with melted butter and press into a pie dish.",
      "Bake the crust for 10 minutes, then cool slightly.",
      "Whisk the condensed milk, egg yolks and lime juice until smooth.",
      "Pour into the crust and bake for 15–18 minutes until just set at the edges.",
      "Chill for at least 3 hours before slicing; serve with whipped cream.",
    ],
  },
  {
    id: "sticky-toffee-pudding",
    name: "Sticky Toffee Pudding",
    category: "Desserts",
    blurb: "Warm date sponge drowned in a rich toffee sauce.",
    time: 60,
    difficulty: "Intermediate",
    servings: 8,
    oven: 180,
    featured: false,
    tags: ["dates", "toffee", "warm dessert", "brown sugar"],
    ingredients: [
      { id: "i1", name: "Pitted dates, chopped", amount: 200, unit: "g" },
      { id: "i2", name: "Baking soda", amount: 1, unit: "tsp" },
      { id: "i3", name: "Butter, softened", amount: 85, unit: "g" },
      { id: "i4", name: "Brown sugar (packed)", amount: 150, unit: "g" },
      { id: "i5", name: "large eggs", amount: 2, unit: null },
      { id: "i6", name: "Self-raising flour", amount: 200, unit: "g" },
      { id: "i7", name: "Heavy cream, for sauce", amount: 200, unit: "ml" },
    ],
    steps: [
      "Simmer the dates in water until soft, then stir in the baking soda and set aside.",
      "Heat the oven to 180°C (350°F) and butter a baking dish.",
      "Cream the butter and half the brown sugar, beat in the eggs, then fold in the flour and the date mixture.",
      "Pour into the dish and bake for 30–35 minutes until risen and set.",
      "Simmer the remaining brown sugar with cream and butter until thickened, then pour over the warm pudding.",
    ],
  },
];

/* --------------------------- Unit conversion ------------------------------ */

const DENSITY_G_PER_CUP = {
  "All-purpose flour": 120,
  "Bread flour": 120,
  "Granulated sugar": 200,
  "Brown sugar (packed)": 220,
  "Powdered sugar": 110,
  Butter: 227,
  "Cocoa powder": 90,
  Honey: 340,
  Milk: 245,
  Water: 237,
  "Vegetable oil": 218,
  "Rolled oats": 90,
  Mascarpone: 240,
  "Heavy cream": 240,
};
const CUP_ML = 236.588;
const GRAMS_PER_OZ = 28.3495;

function toGrams(ingredientKey, amount, unit) {
  const gpc = DENSITY_G_PER_CUP[ingredientKey] || 130;
  switch (unit) {
    case "g": return amount;
    case "kg": return amount * 1000;
    case "oz": return amount * GRAMS_PER_OZ;
    case "cup": return amount * gpc;
    case "tbsp": return amount * (gpc / 16);
    case "tsp": return amount * (gpc / 48);
    case "ml": return amount * (gpc / CUP_ML);
    case "l": return amount * 1000 * (gpc / CUP_ML);
    default: return amount;
  }
}
function fromGrams(ingredientKey, grams, unit) {
  const gpc = DENSITY_G_PER_CUP[ingredientKey] || 130;
  switch (unit) {
    case "g": return grams;
    case "kg": return grams / 1000;
    case "oz": return grams / GRAMS_PER_OZ;
    case "cup": return grams / gpc;
    case "tbsp": return grams / (gpc / 16);
    case "tsp": return grams / (gpc / 48);
    case "ml": return grams / (gpc / CUP_ML);
    case "l": return grams / 1000 / (gpc / CUP_ML);
    default: return grams;
  }
}

const FRACTIONS = [
  [0, ""], [1 / 8, "⅛"], [1 / 4, "¼"], [1 / 3, "⅓"], [3 / 8, "⅜"],
  [1 / 2, "½"], [5 / 8, "⅝"], [2 / 3, "⅔"], [3 / 4, "¾"], [7 / 8, "⅞"], [1, ""],
];
function toFraction(value) {
  if (!isFinite(value) || value < 0) return "0";
  let whole = Math.floor(value);
  const frac = value - whole;
  let best = FRACTIONS[0], bestDiff = Infinity;
  for (const f of FRACTIONS) {
    const diff = Math.abs(frac - f[0]);
    if (diff < bestDiff) { bestDiff = diff; best = f; }
  }
  if (best[0] === 1) whole += 1;
  const symbol = best[0] === 1 ? "" : best[1];
  if (whole === 0 && !symbol) return "0";
  if (whole === 0) return symbol;
  if (!symbol) return `${whole}`;
  return `${whole} ${symbol}`;
}
function formatAmount(value, unit) {
  if (value == null || !isFinite(value)) return "";
  if (["cup", "tbsp", "tsp"].includes(unit) || unit == null) return toFraction(value);
  if (unit === "g" || unit === "ml") return Math.round(value).toString();
  if (unit === "kg" || unit === "l" || unit === "oz") return (Math.round(value * 10) / 10).toString();
  return (Math.round(value * 100) / 100).toString();
}
function unitLabel(unit, amount) {
  if (unit == null) return "";
  const plural = Math.abs(amount - 1) > 0.05;
  const map = { g: "g", kg: "kg", ml: "ml", l: "l", tsp: plural ? "tsp" : "tsp", tbsp: "tbsp", cup: plural ? "cups" : "cup", oz: "oz", pinch: "pinch" };
  return map[unit] || unit;
}

/* --------------------------------- Icons/UI atoms ------------------------- */

function Dial({ size = 56, stroke = 5, progress = 0, ticks = 12, color, track, children }) {
  const t = useT();
  const c = color || t.accent;
  const tr = track || t.border;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const p = Math.min(Math.max(progress, 0), 1);
  const offset = circ * (1 - p);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {Array.from({ length: ticks }).map((_, i) => (
          <line
            key={i}
            x1={size / 2} y1={1.5}
            x2={size / 2} y2={stroke / 2 + 2.5}
            stroke={tr}
            strokeWidth={1.25}
            transform={`rotate(${(i / ticks) * 360} ${size / 2} ${size / 2})`}
          />
        ))}
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tr} strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={c} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.5s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">{children}</div>
      )}
    </div>
  );
}

function Chip({ active, children, onClick, icon: Icon }) {
  const t = useT();
  return (
    <button
      onClick={onClick}
      className="shrink-0 flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-95"
      style={{
        background: active ? t.accent : t.surface,
        color: active ? t.accentContrast : t.text,
        border: `1px solid ${active ? t.accent : t.border}`,
      }}
    >
      {Icon && <Icon size={14} />}
      {children}
    </button>
  );
}

function IconBtn({ onClick, children, active, size = 40 }) {
  const t = useT();
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center rounded-full transition-all duration-200 active:scale-90"
      style={{
        width: size, height: size,
        background: active ? t.accent : t.surfaceAlt,
        color: active ? t.accentContrast : t.text,
      }}
    >
      {children}
    </button>
  );
}

function Card({ children, onClick, className = "", style }) {
  const t = useT();
  return (
    <div
      onClick={onClick}
      className={`rounded-3xl transition-all duration-200 ${onClick ? "cursor-pointer active:scale-[0.98] hover:-translate-y-0.5" : ""} ${className}`}
      style={{ background: t.surface, border: `1px solid ${t.border}`, ...style }}
    >
      {children}
    </div>
  );
}

function PrimaryButton({ children, onClick, icon: Icon, full, disabled }) {
  const t = useT();
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 rounded-full font-medium px-6 py-3 transition-all duration-200 active:scale-95 disabled:opacity-50 ${full ? "w-full" : ""}`}
      style={{ background: t.accent, color: t.accentContrast }}
    >
      {Icon && <Icon size={17} />}
      {children}
    </button>
  );
}

function GhostButton({ children, onClick, icon: Icon, full }) {
  const t = useT();
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-full font-medium px-6 py-3 transition-all duration-200 active:scale-95 ${full ? "w-full" : ""}`}
      style={{ background: t.surfaceAlt, color: t.text, border: `1px solid ${t.border}` }}
    >
      {Icon && <Icon size={17} />}
      {children}
    </button>
  );
}

function SectionHeader({ eyebrow, title, action, onAction }) {
  const t = useT();
  return (
    <div className="flex items-end justify-between mb-3">
      <div>
        {eyebrow && (
          <div className="text-[11px] tracking-[0.14em] uppercase mb-1" style={{ color: t.textSoft, fontFamily: FONT_MONO }}>
            {eyebrow}
          </div>
        )}
        <h2 style={{ fontFamily: FONT_DISPLAY, color: t.text }} className="text-xl font-semibold">
          {title}
        </h2>
      </div>
      {action && (
        <button onClick={onAction} className="flex items-center gap-0.5 text-sm font-medium" style={{ color: t.accentStrong }}>
          {action} <ChevronRight size={15} />
        </button>
      )}
    </div>
  );
}

/* ------------------------------- Recipe card ------------------------------ */

function RecipeCard({ recipe, onOpen, isFav, onToggleFav, wide }) {
  const t = useT();
  const tint = CATEGORY_TINT[recipe.category];
  return (
    <Card onClick={() => onOpen(recipe.id)} className={wide ? "w-[220px]" : "w-full"}>
      <div
        className="relative h-32 rounded-t-3xl flex items-center justify-center overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${tint}55, ${tint}22)` }}
      >
        <CategoryIcon category={recipe.category} size={38} style={{ color: t.accentStrong }} strokeWidth={1.4} />
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFav(recipe.id); }}
          className="absolute top-2.5 right-2.5 flex items-center justify-center w-8 h-8 rounded-full transition-transform active:scale-90"
          style={{ background: t.surface + "E6" }}
        >
          <Heart size={16} fill={isFav ? t.danger : "none"} color={isFav ? t.danger : t.textSoft} strokeWidth={2} />
        </button>
        <span
          className="absolute bottom-2.5 left-2.5 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide font-medium"
          style={{ background: t.surface + "E6", color: t.accentStrong, fontFamily: FONT_MONO }}
        >
          {recipe.category}
        </span>
      </div>
      <div className="p-3.5">
        <h3 className="font-semibold leading-snug mb-1 line-clamp-2" style={{ fontFamily: FONT_DISPLAY, color: t.text }}>
          {recipe.name}
        </h3>
        <p className="text-xs mb-2.5 line-clamp-2" style={{ color: t.textSoft }}>{recipe.blurb}</p>
        <div className="flex items-center gap-3 text-[11px]" style={{ color: t.textSoft, fontFamily: FONT_MONO }}>
          <span className="flex items-center gap-1"><Clock size={12} />{recipe.time < 60 ? `${recipe.time}m` : `${Math.round(recipe.time / 60)}h`}</span>
          <span className="flex items-center gap-1"><UsersIcon size={12} />{recipe.servings}</span>
          <span className="flex items-center gap-1"><Flame size={12} />{recipe.difficulty}</span>
        </div>
      </div>
    </Card>
  );
}

/* --------------------------------- Toast ----------------------------------- */

function Toast({ toast }) {
  const t = useT();
  if (!toast) return null;
  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 bottom-24 md:bottom-8 z-[80] px-5 py-3 rounded-full text-sm font-medium shadow-lg animate-[fadeup_0.25s_ease]"
      style={{ background: t.text, color: t.bg }}
    >
      {toast}
    </div>
  );
}

/* ------------------------------ Unit converter ------------------------------ */

function ConverterModal({ onClose }) {
  const t = useT();
  const ingredientOptions = Object.keys(DENSITY_G_PER_CUP);
  const [ingredient, setIngredient] = useState("All-purpose flour");
  const [amount, setAmount] = useState(1);
  const [fromUnit, setFromUnit] = useState("cup");

  const grams = toGrams(ingredient, Number(amount) || 0, fromUnit);
  const targets = ["g", "kg", "cup", "tbsp", "tsp", "oz", "ml"].filter((u) => u !== fromUnit);

  return (
    <Modal onClose={onClose} title="Unit Converter" icon={Scale}>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: t.textSoft }}>Ingredient</label>
          <select
            value={ingredient}
            onChange={(e) => setIngredient(e.target.value)}
            className="w-full rounded-2xl px-4 py-3 text-sm outline-none"
            style={{ background: t.surfaceAlt, color: t.text, border: `1px solid ${t.border}` }}
          >
            {ingredientOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs font-medium mb-1.5 block" style={{ color: t.textSoft }}>Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-2xl px-4 py-3 text-sm outline-none"
              style={{ background: t.surfaceAlt, color: t.text, border: `1px solid ${t.border}`, fontFamily: FONT_MONO }}
            />
          </div>
          <div className="flex-1">
            <label className="text-xs font-medium mb-1.5 block" style={{ color: t.textSoft }}>Unit</label>
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="w-full rounded-2xl px-4 py-3 text-sm outline-none"
              style={{ background: t.surfaceAlt, color: t.text, border: `1px solid ${t.border}` }}
            >
              {["g", "kg", "cup", "tbsp", "tsp", "oz", "ml"].map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>

        <div className="rounded-2xl p-4 mt-2" style={{ background: t.surfaceAlt }}>
          <div className="text-[11px] uppercase tracking-wide mb-2.5" style={{ color: t.textSoft, fontFamily: FONT_MONO }}>Equivalents</div>
          <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
            {targets.map((u) => (
              <div key={u} className="flex items-baseline justify-between">
                <span className="text-sm" style={{ color: t.textSoft }}>{u}</span>
                <span className="font-semibold" style={{ fontFamily: FONT_MONO, color: t.text }}>
                  {formatAmount(fromGrams(ingredient, grams, u), u)}
                </span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-[11px] leading-relaxed" style={{ color: t.textSoft }}>
          Conversions use typical ingredient density and are approximate — for best results weigh dry ingredients when precision matters.
        </p>
      </div>
    </Modal>
  );
}

/* ---------------------------------- Timer ----------------------------------- */

function TimerModal({ onClose }) {
  const t = useT();
  const PRESETS = [5, 10, 15, 20, 30, 45];
  const [totalSec, setTotalSec] = useState(10 * 60);
  const [remaining, setRemaining] = useState(10 * 60);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [customMin, setCustomMin] = useState("");
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            setDone(true);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  function setPreset(min) {
    clearInterval(intervalRef.current);
    setRunning(false);
    setDone(false);
    setTotalSec(min * 60);
    setRemaining(min * 60);
  }
  function reset() {
    clearInterval(intervalRef.current);
    setRunning(false);
    setDone(false);
    setRemaining(totalSec);
  }
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const progress = totalSec ? remaining / totalSec : 0;

  return (
    <Modal onClose={onClose} title="Baking Timer" icon={TimerIcon}>
      <div className="flex flex-col items-center">
        <div className="my-2">
          <Dial size={200} stroke={10} progress={progress} ticks={24} color={done ? t.success : t.accent}>
            <div className="text-center">
              <div className="text-4xl font-semibold" style={{ fontFamily: FONT_MONO, color: t.text }}>{mm}:{ss}</div>
              <div className="text-xs mt-1" style={{ color: t.textSoft }}>{done ? "Time's up!" : running ? "baking…" : "ready"}</div>
            </div>
          </Dial>
        </div>

        <div className="flex gap-3 mt-4">
          <IconBtn size={52} onClick={() => { setDone(false); setRunning((r) => !r); }} active={running}>
            {running ? <Pause size={20} /> : <Play size={20} />}
          </IconBtn>
          <IconBtn size={52} onClick={reset}><RotateCcw size={19} /></IconBtn>
        </div>

        <div className="w-full mt-6">
          <div className="text-[11px] uppercase tracking-wide mb-2" style={{ color: t.textSoft, fontFamily: FONT_MONO }}>Presets</div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((m) => <Chip key={m} onClick={() => setPreset(m)}>{m} min</Chip>)}
          </div>
        </div>
        <div className="w-full mt-4 flex gap-2">
          <input
            type="number"
            placeholder="Custom minutes"
            value={customMin}
            onChange={(e) => setCustomMin(e.target.value)}
            className="flex-1 rounded-2xl px-4 py-2.5 text-sm outline-none"
            style={{ background: t.surfaceAlt, color: t.text, border: `1px solid ${t.border}` }}
          />
          <button
            onClick={() => customMin && setPreset(Number(customMin))}
            className="px-4 rounded-2xl text-sm font-medium"
            style={{ background: t.accent, color: t.accentContrast }}
          >
            Set
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ---------------------------------- Modal shell ------------------------------ */

function Modal({ onClose, title, icon: Icon, children }) {
  const t = useT();
  return (
    <div className="fixed inset-0 z-[70] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 animate-[fadein_0.2s_ease]" style={{ background: "#00000055" }} onClick={onClose} />
      <div
        className="relative w-full md:max-w-md md:rounded-3xl rounded-t-3xl p-6 max-h-[88vh] overflow-y-auto animate-[slideup_0.25s_cubic-bezier(.4,0,.2,1)]"
        style={{ background: t.bg }}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            {Icon && <Icon size={19} style={{ color: t.accentStrong }} />}
            <h3 className="text-lg font-semibold" style={{ fontFamily: FONT_DISPLAY, color: t.text }}>{title}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: t.surfaceAlt }}>
            <X size={16} style={{ color: t.text }} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ----------------------------------- Pages ----------------------------------- */

function HomePage({ navigate, favorites, toggleFav, openConverter, openTimer, greetingName }) {
  const t = useT();
  const [query, setQuery] = useState("");
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const featured = RECIPES.filter((r) => r.featured);
  const matches = query.trim()
    ? RECIPES.filter((r) => r.name.toLowerCase().includes(query.toLowerCase()) || r.tags.some((tg) => tg.includes(query.toLowerCase()))).slice(0, 5)
    : [];

  return (
    <div className="px-5 pt-6 pb-4 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em]" style={{ color: t.textSoft, fontFamily: FONT_MONO }}>{greeting}</div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: FONT_DISPLAY, color: t.text }}>{greetingName || "Baker"}</h1>
        </div>
        <button onClick={() => navigate("profile")} className="w-11 h-11 rounded-full flex items-center justify-center font-semibold" style={{ background: t.accentSoft, color: t.accentStrong, fontFamily: FONT_DISPLAY }}>
          {(greetingName || "B")[0].toUpperCase()}
        </button>
      </div>

      <div className="relative mb-6">
        <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: t.textSoft }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search recipes or ingredients…"
          className="w-full rounded-full pl-11 pr-4 py-3.5 text-sm outline-none"
          style={{ background: t.surface, color: t.text, border: `1px solid ${t.border}` }}
        />
        {matches.length > 0 && (
          <div className="absolute left-0 right-0 mt-2 rounded-2xl overflow-hidden shadow-lg z-20" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
            {matches.map((r) => (
              <button
                key={r.id}
                onClick={() => { setQuery(""); navigate("detail", r.id); }}
                className="w-full text-left px-4 py-3 flex items-center gap-3 transition-colors hover:bg-[var(--hover-bg)]"
                style={{ "--hover-bg": t.surfaceAlt }}
              >
                <CategoryIcon category={r.category} size={16} style={{ color: t.accentStrong }} />
                <span className="text-sm" style={{ color: t.text }}>{r.name}</span>
              </button>
            ))}
            <button onClick={() => { navigate("library", null, query); setQuery(""); }} className="w-full text-left px-4 py-2.5 text-xs font-medium" style={{ color: t.accentStrong, background: t.surfaceAlt }}>
              See all results for "{query}"
            </button>
          </div>
        )}
      </div>

      <div className="mb-7 -mx-5 px-5 overflow-x-auto">
        <div className="flex gap-2 w-max">
          <Chip active onClick={() => navigate("library")}>All</Chip>
          {CATEGORIES.map((c) => (
            <Chip key={c} icon={CATEGORY_ICON[c]} onClick={() => navigate("library", null, "", c)}>{c}</Chip>
          ))}
        </div>
      </div>

      <SectionHeader eyebrow="Baker's picks" title="Featured Recipes" action="See all" onAction={() => navigate("library")} />
      <div className="-mx-5 px-5 overflow-x-auto mb-8">
        <div className="flex gap-3.5 w-max pb-1">
          {featured.map((r) => (
            <RecipeCard key={r.id} recipe={r} onOpen={(id) => navigate("detail", id)} isFav={favorites.includes(r.id)} onToggleFav={toggleFav} wide />
          ))}
        </div>
      </div>

      <SectionHeader eyebrow="Handy" title="Quick Tools" />
      <div className="grid grid-cols-2 gap-3.5 mb-8">
        <Card onClick={openConverter} className="p-4 flex flex-col gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: t.accentSoft }}><Scale size={18} style={{ color: t.accentStrong }} /></div>
          <div>
            <div className="font-semibold text-sm" style={{ color: t.text }}>Unit Converter</div>
            <div className="text-xs mt-0.5" style={{ color: t.textSoft }}>Grams, cups, ml & oz</div>
          </div>
        </Card>
        <Card onClick={openTimer} className="p-4 flex flex-col gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: t.accentSoft }}><TimerIcon size={18} style={{ color: t.accentStrong }} /></div>
          <div>
            <div className="font-semibold text-sm" style={{ color: t.text }}>Baking Timer</div>
            <div className="text-xs mt-0.5" style={{ color: t.textSoft }}>Never miss the oven</div>
          </div>
        </Card>
      </div>

      <Card onClick={() => navigate("assistant")} className="p-5 flex items-center gap-4" style={{ background: `linear-gradient(135deg, ${t.accentSoft}, ${t.surface})` }}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ background: t.accent }}>
          <Sparkles size={20} color={t.accentContrast} />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm" style={{ color: t.text }}>Have a baking question?</div>
          <div className="text-xs mt-0.5" style={{ color: t.textSoft }}>Ask the CakeLab AI Assistant anything</div>
        </div>
        <ChevronRight size={18} style={{ color: t.accentStrong }} />
      </Card>
    </div>
  );
}

function LibraryPage({ navigate, favorites, toggleFav, initialQuery, initialCategory }) {
  const t = useT();
  const [query, setQuery] = useState(initialQuery || "");
  const [category, setCategory] = useState(initialCategory || "All");

  useEffect(() => { setQuery(initialQuery || ""); }, [initialQuery]);
  useEffect(() => { setCategory(initialCategory || "All"); }, [initialCategory]);

  const filtered = RECIPES.filter((r) => {
    const inCat = category === "All" || r.category === category;
    const q = query.trim().toLowerCase();
    const inQuery = !q || r.name.toLowerCase().includes(q) || r.tags.some((tg) => tg.includes(q));
    return inCat && inQuery;
  });

  return (
    <div className="px-5 pt-6 pb-4 max-w-5xl mx-auto w-full">
      <h1 className="text-2xl font-semibold mb-4" style={{ fontFamily: FONT_DISPLAY, color: t.text }}>Recipe Library</h1>
      <div className="relative mb-4">
        <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: t.textSoft }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or ingredient…"
          className="w-full rounded-full pl-11 pr-4 py-3.5 text-sm outline-none"
          style={{ background: t.surface, color: t.text, border: `1px solid ${t.border}` }}
        />
      </div>
      <div className="mb-6 -mx-5 px-5 overflow-x-auto">
        <div className="flex gap-2 w-max">
          <Chip active={category === "All"} onClick={() => setCategory("All")}>All</Chip>
          {CATEGORIES.map((c) => (
            <Chip key={c} active={category === c} icon={CATEGORY_ICON[c]} onClick={() => setCategory(c)}>{c}</Chip>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <ChefHat size={36} className="mx-auto mb-3" style={{ color: t.textSoft }} />
          <p className="font-medium" style={{ color: t.text }}>No recipes match yet</p>
          <p className="text-sm mt-1" style={{ color: t.textSoft }}>Try a different search or category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
          {filtered.map((r) => (
            <RecipeCard key={r.id} recipe={r} onOpen={(id) => navigate("detail", id)} isFav={favorites.includes(r.id)} onToggleFav={toggleFav} />
          ))}
        </div>
      )}
    </div>
  );
}

function RecipeDetailPage({ recipeId, navigate, favorites, toggleFav, askAI, openTimer }) {
  const t = useT();
  const recipe = RECIPES.find((r) => r.id === recipeId);
  const [servings, setServings] = useState(recipe ? recipe.servings : 1);
  const [doneSteps, setDoneSteps] = useState({});
  const [tab, setTab] = useState("ingredients");

  useEffect(() => {
    if (recipe) { setServings(recipe.servings); setDoneSteps({}); setTab("ingredients"); }
  }, [recipeId]);

  if (!recipe) return null;
  const ratio = servings / recipe.servings;
  const isFav = favorites.includes(recipe.id);
  const doneCount = Object.values(doneSteps).filter(Boolean).length;
  const progress = recipe.steps.length ? doneCount / recipe.steps.length : 0;

  return (
    <div className="max-w-3xl mx-auto w-full pb-8">
      <div
        className="relative h-48 md:h-60 flex items-end px-5 pb-5"
        style={{ background: `linear-gradient(135deg, ${CATEGORY_TINT[recipe.category]}77, ${CATEGORY_TINT[recipe.category]}22)` }}
      >
        <button onClick={() => navigate("back")} className="absolute top-5 left-5 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: t.surface + "E6" }}>
          <ArrowLeft size={18} style={{ color: t.text }} />
        </button>
        <button onClick={() => toggleFav(recipe.id)} className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-90" style={{ background: t.surface + "E6" }}>
          <Heart size={18} fill={isFav ? t.danger : "none"} color={isFav ? t.danger : t.textSoft} />
        </button>
        <CategoryIcon category={recipe.category} size={56} strokeWidth={1.2} style={{ color: t.accentStrong, opacity: 0.5, position: "absolute", right: 24, top: 24 }} />
      </div>

      <div className="px-5 -mt-1">
        <span className="text-[11px] uppercase tracking-wide font-medium" style={{ color: t.accentStrong, fontFamily: FONT_MONO }}>{recipe.category}</span>
        <h1 className="text-2xl font-semibold mt-1 mb-1.5" style={{ fontFamily: FONT_DISPLAY, color: t.text }}>{recipe.name}</h1>
        <p className="text-sm mb-4" style={{ color: t.textSoft }}>{recipe.blurb}</p>

        <div className="flex items-center gap-4 mb-5 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs" style={{ color: t.textSoft }}>
            <Clock size={14} /><span style={{ fontFamily: FONT_MONO }}>{recipe.time < 60 ? `${recipe.time} min` : `${(recipe.time / 60).toFixed(recipe.time % 60 ? 1 : 0)} hr`}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: t.textSoft }}>
            <Flame size={14} /><span>{recipe.difficulty}</span>
          </div>
          {recipe.oven && (
            <div className="flex items-center gap-1.5 text-xs" style={{ color: t.textSoft }}>
              <span style={{ fontFamily: FONT_MONO }}>{recipe.oven}°C oven</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-6 rounded-2xl p-4" style={{ background: t.surfaceAlt }}>
          <div>
            <div className="text-xs mb-0.5" style={{ color: t.textSoft }}>Servings</div>
            <div className="font-semibold" style={{ fontFamily: FONT_MONO, color: t.text }}>{servings}</div>
          </div>
          <div className="flex items-center gap-2">
            <IconBtn size={34} onClick={() => setServings((s) => Math.max(1, s - 1))}><Minus size={15} /></IconBtn>
            <IconBtn size={34} onClick={() => setServings((s) => s + 1)}><Plus size={15} /></IconBtn>
          </div>
        </div>

        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setTab("ingredients")}
            className="flex-1 py-2.5 rounded-full text-sm font-medium transition-all"
            style={{ background: tab === "ingredients" ? t.accent : t.surfaceAlt, color: tab === "ingredients" ? t.accentContrast : t.text }}
          >
            Ingredients
          </button>
          <button
            onClick={() => setTab("steps")}
            className="flex-1 py-2.5 rounded-full text-sm font-medium transition-all"
            style={{ background: tab === "steps" ? t.accent : t.surfaceAlt, color: tab === "steps" ? t.accentContrast : t.text }}
          >
            Instructions
          </button>
        </div>

        {tab === "ingredients" ? (
          <ul className="space-y-2.5 mb-6">
            {recipe.ingredients.map((ing) => {
              const scaled = ing.amount * ratio;
              return (
                <li key={ing.id} className="flex items-baseline justify-between py-2 border-b" style={{ borderColor: t.border }}>
                  <span className="text-sm" style={{ color: t.text }}>{ing.name}</span>
                  <span className="text-sm font-medium shrink-0 ml-3" style={{ fontFamily: FONT_MONO, color: t.accentStrong }}>
                    {formatAmount(scaled, ing.unit)}{ing.unit ? ` ${unitLabel(ing.unit, scaled)}` : ""}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Dial size={44} stroke={4} progress={progress}>
                <span className="text-[11px] font-semibold" style={{ fontFamily: FONT_MONO, color: t.text }}>{doneCount}/{recipe.steps.length}</span>
              </Dial>
              <p className="text-xs" style={{ color: t.textSoft }}>Tap a step to mark it done as you bake.</p>
            </div>
            <ol className="space-y-3">
              {recipe.steps.map((step, i) => {
                const isDone = !!doneSteps[i];
                return (
                  <li
                    key={i}
                    onClick={() => setDoneSteps((d) => ({ ...d, [i]: !d[i] }))}
                    className="flex gap-3 p-3.5 rounded-2xl cursor-pointer transition-all"
                    style={{ background: isDone ? t.accentSoft : t.surfaceAlt, opacity: isDone ? 0.65 : 1 }}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-semibold"
                      style={{ background: isDone ? t.accent : t.surface, color: isDone ? t.accentContrast : t.textSoft, border: `1px solid ${t.border}`, fontFamily: FONT_MONO }}
                    >
                      {isDone ? <Check size={13} /> : i + 1}
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: t.text, textDecoration: isDone ? "line-through" : "none" }}>{step}</p>
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        <div className="flex gap-3">
          <GhostButton icon={TimerIcon} onClick={openTimer} full>Start Timer</GhostButton>
          <PrimaryButton icon={Sparkles} onClick={() => askAI(`I have a question about "${recipe.name}". What can I substitute if I'm missing an ingredient, and any tips for getting it right?`)} full>
            Ask AI
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function FavoritesPage({ navigate, favorites, toggleFav }) {
  const t = useT();
  const favRecipes = RECIPES.filter((r) => favorites.includes(r.id));
  return (
    <div className="px-5 pt-6 pb-4 max-w-5xl mx-auto w-full">
      <h1 className="text-2xl font-semibold mb-5" style={{ fontFamily: FONT_DISPLAY, color: t.text }}>Favorites</h1>
      {favRecipes.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: t.surfaceAlt }}>
            <Heart size={26} style={{ color: t.textSoft }} />
          </div>
          <p className="font-medium" style={{ color: t.text }}>Your recipe box is empty</p>
          <p className="text-sm mt-1 mb-5" style={{ color: t.textSoft }}>Tap the heart on any recipe to save it here.</p>
          <PrimaryButton onClick={() => navigate("library")} icon={Grid3x3}>Browse recipes</PrimaryButton>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
          {favRecipes.map((r) => (
            <RecipeCard key={r.id} recipe={r} onOpen={(id) => navigate("detail", id)} isFav toggleFav={toggleFav} onToggleFav={toggleFav} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProfilePage({ isDark, setIsDark, profile, setProfile, favorites }) {
  const t = useT();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [signedOutMsg, setSignedOutMsg] = useState(false);

  function save() {
    setProfile({ name: name || "Baker", email });
    setEditing(false);
  }

  return (
    <div className="px-5 pt-6 pb-4 max-w-2xl mx-auto w-full">
      <h1 className="text-2xl font-semibold mb-5" style={{ fontFamily: FONT_DISPLAY, color: t.text }}>Profile</h1>

      <Card className="p-5 mb-5">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-semibold shrink-0" style={{ background: t.accentSoft, color: t.accentStrong, fontFamily: FONT_DISPLAY }}>
            {(profile.name || "B")[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-2">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full rounded-xl px-3 py-2 text-sm outline-none" style={{ background: t.surfaceAlt, color: t.text, border: `1px solid ${t.border}` }} />
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-xl px-3 py-2 text-sm outline-none" style={{ background: t.surfaceAlt, color: t.text, border: `1px solid ${t.border}` }} />
              </div>
            ) : (
              <>
                <div className="font-semibold truncate" style={{ color: t.text }}>{profile.name}</div>
                <div className="text-xs flex items-center gap-1 mt-0.5 truncate" style={{ color: t.textSoft }}><Mail size={12} />{profile.email}</div>
              </>
            )}
          </div>
          <button onClick={() => (editing ? save() : setEditing(true))} className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: t.surfaceAlt }}>
            {editing ? <Check size={15} style={{ color: t.accentStrong }} /> : <Pencil size={15} style={{ color: t.text }} />}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-3.5 text-center" style={{ background: t.surfaceAlt }}>
            <div className="text-xl font-semibold" style={{ fontFamily: FONT_MONO, color: t.text }}>{favorites.length}</div>
            <div className="text-[11px] mt-0.5" style={{ color: t.textSoft }}>Favorites</div>
          </div>
          <div className="rounded-2xl p-3.5 text-center" style={{ background: t.surfaceAlt }}>
            <div className="text-xl font-semibold" style={{ fontFamily: FONT_MONO, color: t.text }}>{RECIPES.length}</div>
            <div className="text-[11px] mt-0.5" style={{ color: t.textSoft }}>In Library</div>
          </div>
        </div>
      </Card>

      <Card className="p-5 mb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: t.surfaceAlt }}>
              {isDark ? <Moon size={16} style={{ color: t.text }} /> : <Sun size={16} style={{ color: t.text }} />}
            </div>
            <div>
              <div className="text-sm font-medium" style={{ color: t.text }}>Appearance</div>
              <div className="text-xs" style={{ color: t.textSoft }}>{isDark ? "Dark mode" : "Light mode"}</div>
            </div>
          </div>
          <button
            onClick={() => setIsDark(!isDark)}
            aria-label="Toggle dark mode"
            className="w-14 h-8 rounded-full relative shrink-0 transition-colors duration-300"
            style={{ background: isDark ? t.accent : t.surfaceAlt, border: `1.5px solid ${isDark ? t.accent : t.border}` }}
          >
            <span
              className="absolute top-1 left-1 w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-300"
              style={{ background: t.surface, transform: isDark ? "translateX(24px)" : "translateX(0px)", boxShadow: "0 1px 3px rgba(0,0,0,0.25)" }}
            >
              {isDark ? <Moon size={12} style={{ color: t.accent }} /> : <Sun size={12} style={{ color: t.accentStrong }} />}
            </span>
          </button>
        </div>
      </Card>

      <Card className="p-5 mb-5">
        {signedOutMsg ? (
          <p className="text-sm text-center py-1" style={{ color: t.textSoft }}>You're viewing CakeLab as a guest. Sign back in anytime.</p>
        ) : (
          <button onClick={() => setSignedOutMsg(true)} className="text-sm font-medium w-full text-center py-1" style={{ color: t.danger }}>
            Sign out
          </button>
        )}
      </Card>

      <p className="text-[11px] leading-relaxed text-center px-4" style={{ color: t.textSoft }}>
        This preview stores your favorites and preferences securely per-device. Connect Supabase Authentication and Database in your deployment for full accounts, sync, and multi-device support.
      </p>
    </div>
  );
}

/* ------------------------------- AI Assistant -------------------------------- */

/* Reads from a .env file (VITE_ANTHROPIC_API_KEY=...) — see README.md.
   NOTE: any key used this way ships inside the browser bundle and is
   visible to anyone who opens dev tools. Fine for local testing; for a
   public deployment, move this call behind your own backend/serverless
   function instead. */
const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || "";

const AI_SYSTEM_PROMPT = `You are the CakeLab AI Baking Assistant, embedded in a baking companion app. You help home bakers with:
- Answering baking questions clearly and accurately
- Explaining why baking mistakes happen (e.g. dense cakes, flat cookies, tough bread) and how to fix them
- Recommending recipes from the CakeLab library based on ingredients the user already has
- Suggesting precise ingredient substitutions (ratios included) when someone is missing something
- Giving encouraging, beginner-friendly tips

Keep answers warm, concise, and practical — use short paragraphs or simple dashes for lists, no heavy markdown. Avoid being preachy. When recommending a recipe, prefer ones from this library if a good fit: ${RECIPES.map((r) => `${r.name} (${r.category})`).join(", ")}.`;

const QUICK_PROMPTS = [
  "I don't have buttermilk, what can I use?",
  "Why did my cake sink in the middle?",
  "What can I bake with flour, eggs, and butter?",
  "Give me a beginner tip for working with yeast.",
];

function AIAssistantPage({ pendingPrompt, clearPendingPrompt }) {
  const t = useT();
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi, I'm your CakeLab baking assistant. Ask me anything — substitutions, troubleshooting, or what to bake with what's in your kitchen." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    if (pendingPrompt) {
      send(pendingPrompt);
      clearPendingPrompt();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingPrompt]);

  async function send(text) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const nextMessages = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");

    if (!ANTHROPIC_API_KEY) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          isError: true,
          content:
            "No API key is set up yet. Create a .env file in the project root with:\n\nVITE_ANTHROPIC_API_KEY=your-key-here\n\nthen restart the dev server. See the README for details — and note this wires the key straight into the browser, which is fine for local testing but not for a public deployment.",
        },
      ]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 1000,
          system: AI_SYSTEM_PROMPT,
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      let data = null;
      try { data = await response.json(); } catch { /* non-JSON body */ }

      if (!response.ok) {
        const apiMessage = data?.error?.message || "";
        let friendly = "I couldn't reach the assistant just now — please try again in a moment.";
        if (response.status === 429 || /credit|quota|balance/i.test(apiMessage)) {
          friendly = "The assistant has hit a usage limit for this preview right now, so it can't respond. This isn't something you can fix from here — try again shortly, or reach out to whoever's hosting this if it keeps happening.";
        } else if (response.status === 401 || response.status === 403) {
          friendly = "The assistant isn't authorized to respond right now (an access issue on the app's side, not yours). Try again shortly.";
        } else if (response.status >= 500) {
          friendly = "The assistant service is temporarily down. Please try again in a moment.";
        }
        setMessages((m) => [...m, { role: "assistant", content: friendly, isError: true }]);
        return;
      }

      const blocks = Array.isArray(data?.content) ? data.content : [];
      const text2 = blocks.filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
      setMessages((m) => [...m, { role: "assistant", content: text2 || "Sorry, I couldn't come up with an answer just now — try asking again." }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: "I couldn't connect just now — check your connection and try again.", isError: true }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto w-full">
      <div className="px-5 pt-6 pb-3 flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: t.accent }}>
          <Bot size={19} color={t.accentContrast} />
        </div>
        <div>
          <h1 className="text-lg font-semibold leading-tight" style={{ fontFamily: FONT_DISPLAY, color: t.text }}>Baking Assistant</h1>
          <p className="text-xs" style={{ color: t.textSoft }}>Ask about recipes, substitutions & technique</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 space-y-3.5 pb-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap"
              style={{
                background: m.isError ? "transparent" : m.role === "user" ? t.accent : t.surfaceAlt,
                color: m.isError ? t.danger : m.role === "user" ? t.accentContrast : t.text,
                border: m.isError ? `1px solid ${t.danger}55` : "none",
                borderTopRightRadius: m.role === "user" ? 4 : undefined,
                borderTopLeftRadius: m.role === "assistant" ? 4 : undefined,
              }}
            >
              {m.content}
              {m.isError && (
                <button
                  onClick={() => {
                    const lastUser = [...messages].reverse().find((mm) => mm.role === "user");
                    if (lastUser) send(lastUser.content);
                  }}
                  className="block mt-2 text-xs font-semibold underline underline-offset-2"
                  style={{ color: t.danger }}
                >
                  Try again
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-4 py-3 flex items-center gap-1.5" style={{ background: t.surfaceAlt, borderTopLeftRadius: 4 }}>
              <Loader2 size={14} className="animate-spin" style={{ color: t.textSoft }} />
              <span className="text-xs" style={{ color: t.textSoft }}>thinking…</span>
            </div>
          </div>
        )}
      </div>

      {messages.length < 3 && (
        <div className="px-5 pb-2 -mx-0 overflow-x-auto shrink-0">
          <div className="flex gap-2 w-max">
            {QUICK_PROMPTS.map((p) => <Chip key={p} onClick={() => send(p)}>{p}</Chip>)}
          </div>
        </div>
      )}

      <div className="px-5 py-4 shrink-0" style={{ borderTop: `1px solid ${t.border}` }}>
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask a baking question…"
            className="flex-1 rounded-full px-4 py-3 text-sm outline-none"
            style={{ background: t.surfaceAlt, color: t.text, border: `1px solid ${t.border}` }}
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90 disabled:opacity-40"
            style={{ background: t.accent, color: t.accentContrast }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- Nav ------------------------------------- */

const NAV_ITEMS = [
  { key: "home", label: "Home", icon: Home },
  { key: "library", label: "Library", icon: Grid3x3 },
  { key: "assistant", label: "Assistant", icon: Sparkles },
  { key: "favorites", label: "Favorites", icon: Heart },
  { key: "profile", label: "Profile", icon: User },
];

function BottomNav({ page, navigate }) {
  const t = useT();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-[env(safe-area-inset-bottom)]" style={{ background: t.bg + "F5", borderTop: `1px solid ${t.border}` }}>
      <div className="flex justify-between py-2 max-w-md mx-auto">
        {NAV_ITEMS.map((item) => {
          const active = page === item.key || (page === "detail" && item.key === "library");
          const Icon = item.icon;
          const isAssistant = item.key === "assistant";
          return (
            <button key={item.key} onClick={() => navigate(item.key)} className="flex flex-col items-center gap-1 px-2 py-1 transition-transform active:scale-90">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                style={{ background: active ? t.accent : isAssistant ? t.accentSoft : "transparent" }}
              >
                <Icon size={18} color={active ? t.accentContrast : isAssistant ? t.accentStrong : t.textSoft} />
              </div>
              <span className="text-[10px] font-medium" style={{ color: active ? t.accentStrong : t.textSoft }}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function SideNav({ page, navigate }) {
  const t = useT();
  return (
    <nav className="hidden md:flex flex-col w-56 shrink-0 py-8 px-4 gap-1" style={{ borderRight: `1px solid ${t.border}` }}>
      <div className="flex items-center gap-2 px-3 mb-8">
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: t.accent }}>
          <ChefHat size={16} color={t.accentContrast} />
        </div>
        <span className="text-lg font-semibold" style={{ fontFamily: FONT_DISPLAY, color: t.text }}>CakeLab</span>
      </div>
      {NAV_ITEMS.map((item) => {
        const active = page === item.key || (page === "detail" && item.key === "library");
        const Icon = item.icon;
        return (
          <button
            key={item.key}
            onClick={() => navigate(item.key)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all"
            style={{ background: active ? t.accentSoft : "transparent", color: active ? t.accentStrong : t.text }}
          >
            <Icon size={17} />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

/* ----------------------------------- App ------------------------------------- */

export default function CakeLabApp() {
  const [isDark, setIsDark] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [profile, setProfile] = useState({ name: "Baker", email: "you@example.com" });
  const [ready, setReady] = useState(false);

  const [page, setPage] = useState("home");
  const [history, setHistory] = useState([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [libraryQuery, setLibraryQuery] = useState("");
  const [libraryCategory, setLibraryCategory] = useState("All");

  const [showConverter, setShowConverter] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [toast, setToast] = useState(null);
  const [pendingPrompt, setPendingPrompt] = useState(null);

  useEffect(() => {
    (async () => {
      const [favs, theme, prof] = await Promise.all([
        storageGet("favorites", []),
        storageGet("theme", "light"),
        storageGet("profile", { name: "Baker", email: "you@example.com" }),
      ]);
      setFavorites(favs);
      setIsDark(theme === "dark");
      setProfile(prof);
      setReady(true);
    })();
  }, []);

  useEffect(() => { if (ready) storageSet("favorites", favorites); }, [favorites, ready]);
  useEffect(() => { if (ready) storageSet("theme", isDark ? "dark" : "light"); }, [isDark, ready]);
  useEffect(() => { if (ready) storageSet("profile", profile); }, [profile, ready]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(id);
  }, [toast]);

  const navigate = useCallback((target, recipeId, query, category) => {
    if (target === "back") {
      setHistory((h) => {
        const prev = h[h.length - 1] || "home";
        setPage(prev);
        return h.slice(0, -1);
      });
      return;
    }
    setHistory((h) => [...h, page]);
    if (target === "detail") setSelectedRecipeId(recipeId);
    if (target === "library") {
      setLibraryQuery(query || "");
      setLibraryCategory(category || "All");
    }
    setPage(target);
  }, [page]);

  const toggleFav = useCallback((id) => {
    setFavorites((prev) => {
      const has = prev.includes(id);
      setToast(has ? "Removed from favorites" : "Saved to favorites");
      return has ? prev.filter((f) => f !== id) : [...prev, id];
    });
  }, []);

  const askAI = useCallback((prompt) => {
    setPendingPrompt(prompt);
    navigate("assistant");
  }, [navigate]);

  const t = isDark ? THEME.dark : THEME.light;

  if (!ready) {
    return (
      <div className="w-full h-full min-h-[600px] flex items-center justify-center" style={{ background: "#EAE2D6" }}>
        <Loader2 size={22} className="animate-spin" style={{ color: "#8C6239" }} />
      </div>
    );
  }

  return (
    <ThemeCtx.Provider value={t}>
      <div className="w-full min-h-[600px] flex flex-col md:flex-row" style={{ background: t.bg, fontFamily: FONT_BODY, minHeight: "100dvh" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
          @keyframes fadein { from { opacity: 0 } to { opacity: 1 } }
          @keyframes slideup { from { transform: translateY(24px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
          @keyframes fadeup { from { transform: translate(-50%,8px); opacity: 0 } to { transform: translate(-50%,0); opacity: 1 } }
          * { box-sizing: border-box; }
          input::placeholder { color: ${t.textSoft}; opacity: 0.8; }
          ::-webkit-scrollbar { width: 0px; height: 0px; }
        `}</style>

        <SideNav page={page} navigate={navigate} />

        <div className="flex-1 flex flex-col min-h-0">
          <div className="md:hidden flex items-center gap-2 px-5 pt-5">
            <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: t.accent }}>
              <ChefHat size={14} color={t.accentContrast} />
            </div>
            <span className="text-base font-semibold" style={{ fontFamily: FONT_DISPLAY, color: t.text }}>CakeLab</span>
          </div>

          <div className={`flex-1 min-h-0 ${page === "assistant" ? "flex flex-col overflow-hidden" : "overflow-y-auto"} pb-24 md:pb-8`}>
            {page === "home" && (
              <HomePage
                navigate={navigate}
                favorites={favorites}
                toggleFav={toggleFav}
                openConverter={() => setShowConverter(true)}
                openTimer={() => setShowTimer(true)}
                greetingName={profile.name}
              />
            )}
            {page === "library" && (
              <LibraryPage navigate={navigate} favorites={favorites} toggleFav={toggleFav} initialQuery={libraryQuery} initialCategory={libraryCategory} />
            )}
            {page === "detail" && (
              <RecipeDetailPage recipeId={selectedRecipeId} navigate={navigate} favorites={favorites} toggleFav={toggleFav} askAI={askAI} openTimer={() => setShowTimer(true)} />
            )}
            {page === "assistant" && (
              <AIAssistantPage pendingPrompt={pendingPrompt} clearPendingPrompt={() => setPendingPrompt(null)} />
            )}
            {page === "favorites" && (
              <FavoritesPage navigate={navigate} favorites={favorites} toggleFav={toggleFav} />
            )}
            {page === "profile" && (
              <ProfilePage isDark={isDark} setIsDark={setIsDark} profile={profile} setProfile={setProfile} favorites={favorites} />
            )}
          </div>
        </div>

        <BottomNav page={page} navigate={navigate} />
        {showConverter && <ConverterModal onClose={() => setShowConverter(false)} />}
        {showTimer && <TimerModal onClose={() => setShowTimer(false)} />}
        <Toast toast={toast} />
      </div>
    </ThemeCtx.Provider>
  );
}
