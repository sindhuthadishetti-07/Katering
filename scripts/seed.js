/**
 * KateringKing — Firestore Seed Script
 *
 * Seeds all existing menu data into Firestore.
 * Run once after Firebase setup:
 *
 *   node scripts/seed.js
 *
 * Prerequisites:
 *   1. npm install firebase-admin  (in the project root)
 *   2. Download your Firebase service account key:
 *        Firebase Console → Project Settings → Service Accounts
 *        → Generate new private key → save as scripts/serviceAccountKey.json
 *   3. Run:  node scripts/seed.js
 *
 * The script is IDEMPOTENT — running it more than once will not
 * create duplicate data. It checks the _migration sentinel document
 * before writing and exits early if already seeded.
 *
 * It does NOT overwrite documents that already exist in Firestore,
 * so any admin edits made after the first run are preserved.
 */

const admin = require('firebase-admin');
const path  = require('path');
const fs    = require('fs');

// ─── Initialise Admin SDK ────────────────────────────────────
const keyPath = path.join(__dirname, 'serviceAccountKey.json');
if (!fs.existsSync(keyPath)) {
  console.error(
    '\n❌  serviceAccountKey.json not found.\n' +
    '   Download it from Firebase Console → Project Settings → Service Accounts\n' +
    '   and save it as:  scripts/serviceAccountKey.json\n'
  );
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(require(keyPath)),
});

const db            = admin.firestore();
const SCHEMA_VERSION = 1;

// ─── Collection names (must match cms.js COL constants) ───────
const COL = {
  ITEMS:      'menuItems',
  CATEGORIES: 'menuCategories',
  CONTENT:    'siteContent',
};

// ══════════════════════════════════════════════════════════════
// SEED DATA — extracted exactly from the existing index.html
// ══════════════════════════════════════════════════════════════

// Helper: build a category document
function cat(menuTab, name, subtitle, displayOrder) {
  return { menuTab, name, subtitle: subtitle || '', displayOrder, createdAt: Date.now(), updatedAt: Date.now() };
}

// Helper: build a menu item document
function item(menuTab, categoryKey, name, opts = {}) {
  return {
    menuTab,
    categoryKey,          // used during seeding to link to category
    name,
    variant:      opts.variant      || '',
    description:  opts.description  || '',
    imageUrl:     opts.imageUrl     || '',
    imagePath:    opts.imagePath    || '',
    price:        opts.price        || '',
    displayOrder: opts.order        || 0,
    featured:     opts.featured     || false,
    status:       'published',
    createdAt:    Date.now(),
    updatedAt:    Date.now(),
  };
}

// ── NON-VEGETARIAN MENU ────────────────────────────────────────
const NONVEG_CATEGORIES = [
  cat('nonveg', 'Soups',              '', 0),
  cat('nonveg', 'Salads',             '', 1),
  cat('nonveg', 'Chicken Starter',    '', 2),
  cat('nonveg', 'Mutton Starters',    '', 3),
  cat('nonveg', 'Sea Food Starters',  '', 4),
  cat('nonveg', 'Chicken Gravy',      '', 5),
  cat('nonveg', 'Mutton Gravy',       '', 6),
  cat('nonveg', 'Sea Food Gravy',     '', 7),
  cat('nonveg', 'Biryani',            '', 8),
  cat('nonveg', 'Indian Breads',      '', 9),
  cat('nonveg', 'Accompaniments',     '', 10),
  cat('nonveg', 'Desserts',           '', 11),
];

const NONVEG_ITEMS = [
  // Soups
  item('nonveg','Soups','Marag',                  {order:0}),
  item('nonveg','Soups','Nahari Paya',             {order:1}),
  item('nonveg','Soups','Malai Paya',              {order:2}),
  item('nonveg','Soups','Mutton Shorba',           {order:3}),
  item('nonveg','Soups','Murg Badami Shorba',      {order:4}),
  item('nonveg','Soups','Chicken Corn Soup',       {order:5}),
  item('nonveg','Soups','Chicken Hot & Salt',      {order:6}),
  // Salads
  item('nonveg','Salads','Green Salad',            {order:0}),
  item('nonveg','Salads','Russian Salad',          {order:1}),
  item('nonveg','Salads','Waldorf Salad',          {order:2}),
  item('nonveg','Salads','Apple Corn Salad',       {order:3}),
  item('nonveg','Salads','Cucumber and Yogurt Salad',{order:4}),
  item('nonveg','Salads','Aloo Chana Chart',       {order:5}),
  item('nonveg','Salads','Beans Sprout Salad',     {order:6}),
  item('nonveg','Salads','Pasta Salad',            {order:7}),
  item('nonveg','Salads','Kimchi Salad',           {order:8}),
  item('nonveg','Salads','Falafel Salad',          {order:9}),
  item('nonveg','Salads','Muttabel',               {order:10}),
  item('nonveg','Salads','Baba Ghanoush',          {order:11}),
  // Chicken Starter
  item('nonveg','Chicken Starter','Chicken 65',            {order:0}),
  item('nonveg','Chicken Starter','Chicken Majestic',      {order:1}),
  item('nonveg','Chicken Starter','Apollo Chicken',        {order:2}),
  item('nonveg','Chicken Starter','Chicken Manchuria',     {order:3}),
  item('nonveg','Chicken Starter','Chicken Satay (Stick Chicken)',{order:4}),
  item('nonveg','Chicken Starter','Chicken Spring Rolls',  {order:5}),
  item('nonveg','Chicken Starter','Pepper Chicken',        {order:6}),
  item('nonveg','Chicken Starter','Tandoori Chicken',      {order:7}),
  item('nonveg','Chicken Starter','Chicken Tikka',         {order:8}),
  item('nonveg','Chicken Starter','Reshmi Kabab',          {order:9}),
  item('nonveg','Chicken Starter','Banjara Kabab',         {order:10}),
  item('nonveg','Chicken Starter','Murg Malai Kabab',      {order:11}),
  item('nonveg','Chicken Starter','Alfaham',               {order:12}),
  item('nonveg','Chicken Starter','Chicken Drumsticks',    {order:13}),
  item('nonveg','Chicken Starter','Chicken Sheek Kabab',   {order:14}),
  item('nonveg','Chicken Starter','Pathar ka Murg',        {order:15}),
  item('nonveg','Chicken Starter','Shami Kabab',           {order:16}),
  // Mutton Starters
  item('nonveg','Mutton Starters','Lukmi',                 {order:0}),
  item('nonveg','Mutton Starters','Dum ke Kabab',          {order:1}),
  item('nonveg','Mutton Starters','Mutton Sheek Kabab',    {order:2}),
  item('nonveg','Mutton Starters','Patthar ka Gosht',      {order:3}),
  item('nonveg','Mutton Starters','Mutton Boti Kabab',     {order:4}),
  item('nonveg','Mutton Starters','Barra Kabab',           {order:5}),
  item('nonveg','Mutton Starters','Shami Kabab',           {order:6}),
  item('nonveg','Mutton Starters','Shikampoor',            {order:7}),
  item('nonveg','Mutton Starters','Mutton Chops',          {order:8}),
  item('nonveg','Mutton Starters','Tala Hua Gosht',        {order:9}),
  item('nonveg','Mutton Starters','Mutton Fry (Andhra Style)',{order:10}),
  item('nonveg','Mutton Starters','Mutton Galouti Kabab',  {order:11}),
  item('nonveg','Mutton Starters','Gurda Kaleji Fry',      {order:12}),
  item('nonveg','Mutton Starters','Pepper Mutton',         {order:13}),
  // Sea Food Starters
  item('nonveg','Sea Food Starters','Apollo Fish',         {order:0}),
  item('nonveg','Sea Food Starters','Crum Fried Fish',     {order:1}),
  item('nonveg','Sea Food Starters','Corn Fried Fish',     {order:2}),
  item('nonveg','Sea Food Starters','Fish Majestic',       {order:3}),
  item('nonveg','Sea Food Starters','Tawa Fish',           {order:4}),
  item('nonveg','Sea Food Starters','Fish Fingers',        {order:5}),
  item('nonveg','Sea Food Starters','Fish Bullets',        {order:6}),
  item('nonveg','Sea Food Starters','Pepper Fish',         {order:7}),
  item('nonveg','Sea Food Starters','Grilled Fish',        {order:8}),
  item('nonveg','Sea Food Starters','Fish Koliwada',       {order:9}),
  item('nonveg','Sea Food Starters','Fish Manchuria',      {order:10}),
  item('nonveg','Sea Food Starters','Chilli Fish',         {order:11}),
  item('nonveg','Sea Food Starters','Saute Prawns',        {order:12}),
  item('nonveg','Sea Food Starters','Goan Prawns',         {order:13}),
  item('nonveg','Sea Food Starters','Tandoori Prawns',     {order:14}),
  item('nonveg','Sea Food Starters','Butter Garlic Prawns',{order:15}),
  item('nonveg','Sea Food Starters','Pepper Prawns',       {order:16}),
  item('nonveg','Sea Food Starters','Ginger Prawns',       {order:17}),
  item('nonveg','Sea Food Starters','Prawns Koliwada',     {order:18}),
  // Chicken Gravy
  item('nonveg','Chicken Gravy','Dum ka Murg',             {order:0}),
  item('nonveg','Chicken Gravy','Lagani Murg',             {order:1}),
  item('nonveg','Chicken Gravy','Kadai Murgh',             {order:2}),
  item('nonveg','Chicken Gravy','Mughlai Murgh',           {order:3}),
  item('nonveg','Chicken Gravy','Murgh Kali Mirch',        {order:4}),
  item('nonveg','Chicken Gravy','Chicken Khorma',          {order:5}),
  item('nonveg','Chicken Gravy','Murgh Shahi Khorma',      {order:6}),
  item('nonveg','Chicken Gravy','Murgh Do Payaza',         {order:7}),
  item('nonveg','Chicken Gravy','Hindustani Khorma',       {order:8}),
  item('nonveg','Chicken Gravy','Murgh Mussallam',         {order:9}),
  // Mutton Gravy
  item('nonveg','Mutton Gravy','Dum ka Gosht',             {order:0}),
  item('nonveg','Mutton Gravy','Kadai Gosht',              {order:1}),
  item('nonveg','Mutton Gravy','Mughlai Mutton',           {order:2}),
  item('nonveg','Mutton Gravy','Mutton Khorma',            {order:3}),
  item('nonveg','Mutton Gravy','Gosht Do Payaza',          {order:4}),
  item('nonveg','Mutton Gravy','Gosht Dalcha',             {order:5}),
  item('nonveg','Mutton Gravy','Mutton Rogan Josh',        {order:6}),
  // Sea Food Gravy
  item('nonveg','Sea Food Gravy','Dum Ki Machchi',         {order:0}),
  item('nonveg','Sea Food Gravy','Machchi Ka Salan',       {order:1}),
  item('nonveg','Sea Food Gravy','Kadai Machchi',          {order:2}),
  item('nonveg','Sea Food Gravy','Saag Wali Machchi',      {order:3}),
  item('nonveg','Sea Food Gravy','Machchi Rogan Josh',     {order:4}),
  item('nonveg','Sea Food Gravy','Kashmiri Fish Curry',    {order:5}),
  item('nonveg','Sea Food Gravy','Sarson ka Prawns',       {order:6}),
  item('nonveg','Sea Food Gravy','Palak Prawns',           {order:7}),
  item('nonveg','Sea Food Gravy','Kasturi Prawns',         {order:8}),
  item('nonveg','Sea Food Gravy','Kadai Prawns',           {order:9}),
  item('nonveg','Sea Food Gravy','Shahi Prawns',           {order:10}),
  item('nonveg','Sea Food Gravy','Prawns Masala',          {order:11}),
  // Biryani
  item('nonveg','Biryani','Mutton Dum Biryani',            {order:0}),
  item('nonveg','Biryani','Mutton Sufyani Biryani',        {order:1}),
  item('nonveg','Biryani','Mutton Kheema Biryani',         {order:2}),
  item('nonveg','Biryani','Mutton Tahari',                 {order:3}),
  item('nonveg','Biryani','Chicken Dum Biryani',           {order:4}),
  item('nonveg','Biryani','Chicken Sufyani Biryani',       {order:5}),
  item('nonveg','Biryani','Chicken Kheema Biryani',        {order:6}),
  item('nonveg','Biryani','Chicken Boneless Biryani',      {order:7}),
  item('nonveg','Biryani','Chicken Tahari',                {order:8}),
  // Indian Breads
  item('nonveg','Indian Breads','Rumali Roti',             {order:0}),
  item('nonveg','Indian Breads','Tawa Paratha',            {order:1}),
  item('nonveg','Indian Breads','Butter Naan',             {order:2}),
  item('nonveg','Indian Breads','Plain Naan',              {order:3}),
  item('nonveg','Indian Breads','Cheese Naan',             {order:4}),
  item('nonveg','Indian Breads','Garlic Naan',             {order:5}),
  item('nonveg','Indian Breads','Dil Naan',                {order:6}),
  item('nonveg','Indian Breads','Paan Naan',               {order:7}),
  item('nonveg','Indian Breads','Sunehri Naan',            {order:8}),
  item('nonveg','Indian Breads','Plain Kulcha',            {order:9}),
  item('nonveg','Indian Breads','Masala Kulcha',           {order:10}),
  item('nonveg','Indian Breads','Kheema Kulcha',           {order:11}),
  // Accompaniments
  item('nonveg','Accompaniments','Mirchi Ka Salan',        {order:0}),
  item('nonveg','Accompaniments','Bagare Baigan',          {order:1}),
  item('nonveg','Accompaniments','Dum ke Tamate',          {order:2}),
  item('nonveg','Accompaniments','Tamato ka Kut',          {order:3}),
  item('nonveg','Accompaniments','Dahi ki Chutney',        {order:4}),
  item('nonveg','Accompaniments','Raita',                  {order:5}),
  item('nonveg','Accompaniments','Bondi Raita',            {order:6}),
  // Desserts
  item('nonveg','Desserts','Double ka Metha',              {order:0}),
  item('nonveg','Desserts','Shahi Tukda',                  {order:1}),
  item('nonveg','Desserts','Qubani ka Metha',              {order:2}),
  item('nonveg','Desserts','Kaddu ki Kheer',               {order:3}),
  item('nonveg','Desserts','Feerni',                       {order:4}),
  item('nonveg','Desserts','Kashmiri Rabdi',               {order:5}),
  item('nonveg','Desserts','Leechi Malai Rabdi',           {order:6}),
  item('nonveg','Desserts','Badam ki Kheer',               {order:7}),
  item('nonveg','Desserts','Apricot Triffle Pudding',      {order:8}),
  item('nonveg','Desserts','Sunrise Pudding',              {order:9}),
  item('nonveg','Desserts','Anjeer Rabdi',                 {order:10}),
  item('nonveg','Desserts','Fruit Custard',                {order:11}),
  item('nonveg','Desserts','Cream Fruit',                  {order:12}),
  item('nonveg','Desserts','Mango Souffle',                {order:13}),
  item('nonveg','Desserts','Chocolate Souffle',            {order:14}),
  item('nonveg','Desserts','Caramel Custard',              {order:15}),
  item('nonveg','Desserts','Sheer Khurma',                 {order:16}),
];

// ── VEGETARIAN MENU ────────────────────────────────────────────
const VEG_CATEGORIES = [
  cat('veg', 'Soups',                '', 0),
  cat('veg', 'Salads',               '', 1),
  cat('veg', 'Paneer Starters',      '', 2),
  cat('veg', 'Vegetable Starters',   '', 3),
  cat('veg', 'Paneer Gravy',         '', 4),
  cat('veg', 'Vegetable Gravy',      '', 5),
  cat('veg', 'Dal',                  '', 6),
  cat('veg', 'Sambar and Rasam',     '', 7),
  cat('veg', 'Biryani',              '', 8),
  cat('veg', 'Rice & Noodles',       '', 9),
  cat('veg', 'Indian Breads',        '', 10),
  cat('veg', 'Accompaniments',       '', 11),
  cat('veg', 'Desserts',             '', 12),
  cat('veg', 'Icecreams',            '', 13),
];

const VEG_ITEMS = [
  // Soups
  item('veg','Soups','Cream of Mushroom',           {order:0}),
  item('veg','Soups','Cream of Tomato',             {order:1}),
  item('veg','Soups','Spinach With Corn Soup',      {order:2}),
  item('veg','Soups','Wonton & Noodles Soup',       {order:3}),
  item('veg','Soups','Tom Yum Soup',                {order:4}),
  item('veg','Soups','Chick Pea Soup',              {order:5}),
  item('veg','Soups','Vegetable Corn Soup',         {order:6}),
  item('veg','Soups','Vegetable Cantonese Soup',    {order:7}),
  item('veg','Soups','Vegetable Hot & Sour Soup',   {order:8}),
  // Salads
  item('veg','Salads','Green Salad',                {order:0}),
  item('veg','Salads','Russian Salad',              {order:1}),
  item('veg','Salads','Waldorf Salad',              {order:2}),
  item('veg','Salads','Apple Corn Salad',           {order:3}),
  item('veg','Salads','Cucumber and Yogurt Salad',  {order:4}),
  item('veg','Salads','Aloo Chana Chart',           {order:5}),
  item('veg','Salads','Beans Sprout Salad',         {order:6}),
  item('veg','Salads','Pasta Salad',                {order:7}),
  item('veg','Salads','Kimchi Salad',               {order:8}),
  item('veg','Salads','Falafel Salad',              {order:9}),
  item('veg','Salads','Muttabel',                   {order:10}),
  item('veg','Salads','Baba Ghanoush',              {order:11}),
  // Paneer Starters
  item('veg','Paneer Starters','Paneer Tikka',      {order:0}),
  item('veg','Paneer Starters','Thread Paneer',     {order:1}),
  item('veg','Paneer Starters','Paneer Saute',      {order:2}),
  item('veg','Paneer Starters','Paneer Fingers',    {order:3}),
  item('veg','Paneer Starters','Chilli Paneer',     {order:4}),
  item('veg','Paneer Starters','Paneer Shashlik',   {order:5}),
  item('veg','Paneer Starters','Shezwan Paneer',    {order:6}),
  item('veg','Paneer Starters','Paneer Bullets',    {order:7}),
  item('veg','Paneer Starters','Paneer Pepper',     {order:8}),
  item('veg','Paneer Starters','Paneer Majestic',   {order:9}),
  // Vegetable Starters
  item('veg','Vegetable Starters','Vegetable Gold Finger',  {order:0}),
  item('veg','Vegetable Starters','Vegetable Spring Roll',   {order:1}),
  item('veg','Vegetable Starters','Vegetable Bullets',       {order:2}),
  item('veg','Vegetable Starters','Vegetable Manchuria',     {order:3}),
  item('veg','Vegetable Starters','Vegetable Dragon Roll',   {order:4}),
  item('veg','Vegetable Starters','Vegetable Shanghai Roll', {order:5}),
  item('veg','Vegetable Starters','Veg Wontons',             {order:6}),
  item('veg','Vegetable Starters','Cocktail Samosa',         {order:7}),
  item('veg','Vegetable Starters','Vegetable Kabab',         {order:8}),
  // Paneer Gravy
  item('veg','Paneer Gravy','Paneer Afghani',           {order:0}),
  item('veg','Paneer Gravy','Paneer Do Payaza',         {order:1}),
  item('veg','Paneer Gravy','Paneer Butter Masala',     {order:2}),
  item('veg','Paneer Gravy','Handi Paneer',             {order:3}),
  item('veg','Paneer Gravy','Paneer Saag Wala',         {order:4}),
  item('veg','Paneer Gravy','Paneer Tikka in Gravy',    {order:5}),
  item('veg','Paneer Gravy','Paneer Mirch Masala',      {order:6}),
  item('veg','Paneer Gravy','Paneer Shahi Masala',      {order:7}),
  item('veg','Paneer Gravy','Achari Paneer',            {order:8}),
  // Vegetable Gravy
  item('veg','Vegetable Gravy','Mutter Rogan Josh',     {order:0}),
  item('veg','Vegetable Gravy','Achari Mushroom',       {order:1}),
  item('veg','Vegetable Gravy','Kadai Vegetarian',      {order:2}),
  item('veg','Vegetable Gravy','Mutter Baby Corn',      {order:3}),
  item('veg','Vegetable Gravy','Vegetable do Payaza',   {order:4}),
  item('veg','Vegetable Gravy','Ginger Aloo',           {order:5}),
  item('veg','Vegetable Gravy','Baigan Aloo Saag',      {order:6}),
  item('veg','Vegetable Gravy','Bagara Baigan',         {order:7}),
  item('veg','Vegetable Gravy','Achari Vegetable',      {order:8}),
  item('veg','Vegetable Gravy','Mutton Paalak',         {order:9}),
  item('veg','Vegetable Gravy','Malai Kofta',           {order:10}),
  item('veg','Vegetable Gravy','Mutter Palak',          {order:11}),
  item('veg','Vegetable Gravy','Aloo Jeera',            {order:12}),
  // Dal
  item('veg','Dal','Dal Fry',                           {order:0}),
  item('veg','Dal','Dal Makhni',                        {order:1}),
  item('veg','Dal','Dal Tadka',                         {order:2}),
  item('veg','Dal','Cucumber Dal',                      {order:3}),
  item('veg','Dal','Tomato Dal',                        {order:4}),
  item('veg','Dal','Mango Dal',                         {order:5}),
  item('veg','Dal','Beerakaya Dal',                     {order:6}),
  item('veg','Dal','Kaddu ka Dalcha',                   {order:7}),
  // Sambar and Rasam
  item('veg','Sambar and Rasam','Sambar',               {order:0}),
  item('veg','Sambar and Rasam','Mysore Rasam',         {order:1}),
  item('veg','Sambar and Rasam','Pepper Rasam',         {order:2}),
  item('veg','Sambar and Rasam','Tomato Rasam',         {order:3}),
  item('veg','Sambar and Rasam','Beetroot Rasam',       {order:4}),
  // Biryani
  item('veg','Biryani','Vegetable Dum Biryani',         {order:0}),
  item('veg','Biryani','Paneer Biryani',                {order:1}),
  item('veg','Biryani','Mushroom Biryani',              {order:2}),
  item('veg','Biryani','Meal Maker Biryani',            {order:3}),
  item('veg','Biryani','Kashmiri Pulao',                {order:4}),
  item('veg','Biryani','Vegetable Pulao',               {order:5}),
  item('veg','Biryani','Tiranga Pulao',                 {order:6}),
  // Rice & Noodles
  item('veg','Rice & Noodles','Jeera Rice',             {order:0}),
  item('veg','Rice & Noodles','Pudina Rice',            {order:1}),
  item('veg','Rice & Noodles','Tomato Rice',            {order:2}),
  item('veg','Rice & Noodles','Curd Rice',              {order:3}),
  item('veg','Rice & Noodles','Gatte Ka Chawal',        {order:4}),
  item('veg','Rice & Noodles','Mutter Vadi Chawal',     {order:5}),
  item('veg','Rice & Noodles','Mango Pulihora',         {order:6}),
  item('veg','Rice & Noodles','Gongura Pulihora',       {order:7}),
  item('veg','Rice & Noodles','Plain Rice',             {order:8}),
  item('veg','Rice & Noodles','Vegetable Soft Noodles', {order:9}),
  item('veg','Rice & Noodles','Vegetable Shezwan Noodles',{order:10}),
  item('veg','Rice & Noodles','Ginger Mix Noodles',     {order:11}),
  // Indian Breads
  item('veg','Indian Breads','Rumali Roti',             {order:0}),
  item('veg','Indian Breads','Tawa Paratha',            {order:1}),
  item('veg','Indian Breads','Butter Naan',             {order:2}),
  item('veg','Indian Breads','Plain Naan',              {order:3}),
  item('veg','Indian Breads','Cheese Naan',             {order:4}),
  item('veg','Indian Breads','Garlic Naan',             {order:5}),
  item('veg','Indian Breads','Dil Naan',                {order:6}),
  item('veg','Indian Breads','Paan Naan',               {order:7}),
  item('veg','Indian Breads','Sunehri Naan',            {order:8}),
  item('veg','Indian Breads','Plain Kulcha',            {order:9}),
  item('veg','Indian Breads','Masala Kulcha',           {order:10}),
  // Accompaniments
  item('veg','Accompaniments','Mirchi Ka Salan',        {order:0}),
  item('veg','Accompaniments','Bagare Baigan',          {order:1}),
  item('veg','Accompaniments','Dum ke Tamate',          {order:2}),
  item('veg','Accompaniments','Tamato ka Kut',          {order:3}),
  item('veg','Accompaniments','Dahi ki Chutney',        {order:4}),
  item('veg','Accompaniments','Raita',                  {order:5}),
  item('veg','Accompaniments','Bondi Raita',            {order:6}),
  item('veg','Accompaniments','Plain Curd',             {order:7}),
  item('veg','Accompaniments','Chutney',                {order:8}),
  item('veg','Accompaniments','Pickles',                {order:9}),
  // Desserts
  item('veg','Desserts','Double ka Metha',              {order:0}),
  item('veg','Desserts','Shahi Tukda',                  {order:1}),
  item('veg','Desserts','Qubani ka Metha',              {order:2}),
  item('veg','Desserts','Kaddu ki Kheer',               {order:3}),
  item('veg','Desserts','Feerni',                       {order:4}),
  item('veg','Desserts','Kashmiri Rabdi',               {order:5}),
  item('veg','Desserts','Leechi Malai Rabdi',           {order:6}),
  item('veg','Desserts','Badam ki Kheer',               {order:7}),
  item('veg','Desserts','Apricot Triffle Pudding',      {order:8}),
  item('veg','Desserts','Sunrise Pudding',              {order:9}),
  item('veg','Desserts','Anjeer Rabdi',                 {order:10}),
  item('veg','Desserts','Fruit Custard',                {order:11}),
  item('veg','Desserts','Cream Fruit',                  {order:12}),
  item('veg','Desserts','Mango Souffle',                {order:13}),
  item('veg','Desserts','Chocolate Souffle',            {order:14}),
  item('veg','Desserts','Caramel Custard',              {order:15}),
  item('veg','Desserts','Sheer Khurma',                 {order:16}),
  // Icecreams
  item('veg','Icecreams','Vanilla',                     {order:0}),
  item('veg','Icecreams','Strawberry',                  {order:1}),
  item('veg','Icecreams','Mango',                       {order:2}),
  item('veg','Icecreams','Chocolate',                   {order:3}),
  item('veg','Icecreams','Butter Scotch',               {order:4}),
];

// ── SIGNATURE RESERVE ─────────────────────────────────────────
const SIG_CATEGORIES = [
  cat('signature','The Royal Roasts & Cuts', 'Slow-Cooked Masterpieces',   0),
  cat('signature','Artisanal Bites',          'Handcrafted with Precision', 1),
  cat('signature','The Centerpieces',         'Showstopper Dishes',         2),
];

const SIG_ITEMS = [
  // Royal Roasts
  item('signature','The Royal Roasts & Cuts','Kareli Roast',{
    variant:     '(Lamb Shanks)',
    description: 'Tender lamb shanks deeply marinated and slow-roasted until the meat falls from the bone — bold, aromatic, and unforgettable.',
    imageUrl:    'assets/pictrues/Kareli roast.jpg',
    order:       0,
  }),
  // Artisanal Bites
  item('signature','Artisanal Bites','Warqi Samosa',{
    description: 'A Hyderabadi classic — flaky, multi-layered pastry filled with seasoned meat, folded and fried until shatteringly crisp.',
    imageUrl:    'assets/pictrues/Warqi.jpg',
    order:       0,
  }),
  item('signature','Artisanal Bites','Lukmi',{
    variant:     '(Mutton & Chicken)',
    description: 'The iconic square Hyderabadi pastry — a delicate, unleavened dough pocket filled with spiced minced meat and deep-fried to golden perfection.',
    imageUrl:    'assets/pictrues/Warqi Samosa.jpg',
    order:       1,
  }),
  // Centerpieces
  item('signature','The Centerpieces','Murgh Mussallam',{
    description: 'A whole chicken marinated in rich spices and slow-cooked in the royal Mughal tradition — visually spectacular, impossibly tender.',
    imageUrl:    'assets/pictrues/Murgh-Musallam.jpg',
    order:       0,
  }),
  item('signature','The Centerpieces','Phattar Ka Gosht',{
    description: 'An ancient Deccan technique — meat cooked directly on a scorching hot stone, sealing in all juices and creating a crust of extraordinary depth.',
    imageUrl:    'assets/pictrues/Phatar ka gosht.jpeg',
    order:       1,
  }),
  item('signature','The Centerpieces','Dum Ke Chops',{
    description: 'Succulent lamb chops marinated and sealed in a tight dum vessel, slow-cooked until every fibre is infused with aromatic spice.',
    imageUrl:    'https://images.unsplash.com/photo-1558030006-450675393462?w=600&h=420&fit=crop&q=85',
    order:       2,
  }),
  item('signature','The Centerpieces','Cold Fish Salads',{
    description: 'Delicately spiced and elegantly composed — a refined contrast on the table, balancing the richness of the main feast with precision and grace.',
    imageUrl:    'assets/pictrues/Cold Fish Salad.JPG',
    order:       3,
  }),
];

// ══════════════════════════════════════════════════════════════
// SEED FUNCTION
// ══════════════════════════════════════════════════════════════

async function seed() {
  console.log('\n🌱  KateringKing Firestore Seed Script');
  console.log('─'.repeat(50));

  // Check migration sentinel
  const sentinel = await db.collection(COL.CONTENT).doc('_migration').get();
  if (sentinel.exists && sentinel.data().version >= 1) {
    console.log('✅  Already seeded (schema v' + sentinel.data().version + '). Exiting.');
    console.log('   Delete the _migration document in Firestore to re-seed.');
    process.exit(0);
  }

  let totalCats  = 0;
  let totalItems = 0;

  // ── Seed a menu tab ────────────────────────────────────────
  async function seedTab(categories, items, tabLabel) {
    console.log(`\n📂  Seeding ${tabLabel}...`);

    // Build categoryName → docId map
    const catMap = {};

    for (const c of categories) {
      // Use a deterministic ID so re-runs don't duplicate
      const docId = `${c.menuTab}_${c.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
      const ref   = db.collection(COL.CATEGORIES).doc(docId);
      const snap  = await ref.get();
      if (!snap.exists) {
        await ref.set(c);
        console.log(`  ✓ Category: ${c.name}`);
        totalCats++;
      } else {
        console.log(`  – Category exists: ${c.name}`);
      }
      catMap[c.name] = docId;
    }

    // Batch-write items (500 per batch — Firestore limit)
    const BATCH_SIZE = 400;
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      const batch = db.batch();
      const chunk = items.slice(i, i + BATCH_SIZE);

      for (const it of chunk) {
        const categoryId  = catMap[it.categoryKey] || '';
        const { categoryKey, ...fields } = it;

        const docId = `${fields.menuTab}_${fields.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${i}`;
        const ref   = db.collection(COL.ITEMS).doc(docId);
        const snap  = await ref.get();

        if (!snap.exists) {
          batch.set(ref, { ...fields, categoryId });
          totalItems++;
        }
      }
      await batch.commit();
    }

    console.log(`  ✓ ${tabLabel} items written.`);
  }

  await seedTab(NONVEG_CATEGORIES,  NONVEG_ITEMS,  'Non-Vegetarian Menu');
  await seedTab(VEG_CATEGORIES,     VEG_ITEMS,     'Vegetarian Menu');
  await seedTab(SIG_CATEGORIES,     SIG_ITEMS,     'Signature Reserve');

  // Mark migration complete
  await db.collection(COL.CONTENT).doc('_migration').set({
    version:    1,
    migratedAt: Date.now(),
    counts: { categories: totalCats, items: totalItems },
  });

  console.log('\n' + '─'.repeat(50));
  console.log(`✅  Seed complete!`);
  console.log(`   Categories written : ${totalCats}`);
  console.log(`   Items written      : ${totalItems}`);
  console.log('─'.repeat(50) + '\n');
  process.exit(0);
}

seed().catch(err => {
  console.error('\n❌  Seed failed:', err.message);
  process.exit(1);
});
