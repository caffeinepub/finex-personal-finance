import Map "mo:core/Map";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public type CategoryType = {
    #income;
    #expense;
  };

  public type Category = {
    id : Text;
    name : Text;
    color : Text;
    categoryType : CategoryType;
    icon : ?Text;
  };

  module Category {
    public func compareByType(cat1 : Category, cat2 : Category) : Order.Order {
      switch (Text.compare(cat1.name, cat2.name)) {
        case (#equal) {
          switch (cat1.categoryType, cat2.categoryType) {
            case (#income, #expense) { #less };
            case (#expense, #income) { #greater };
            case (_) { #equal };
          };
        };
        case (order) {
          order;
        };
      };
    };

    public func compareByColor(cat1 : Category, cat2 : Category) : Order.Order {
      switch (Text.compare(cat1.color, cat2.color)) {
        case (#equal) {
          Text.compare(cat1.name, cat2.name);
        };
        case (other) { other };
      };
    };
  };

  public type Transaction = {
    id : Text;
    transactionType : CategoryType;
    categoryId : Text;
    amount : Nat;
    date : Int;
    note : Text;
    receiptId : ?Text;
  };

  module Transaction {
    public func compare(transaction1 : Transaction, transaction2 : Transaction) : Order.Order {
      switch (Int.compare(transaction1.date, transaction2.date)) {
        case (#equal) { Text.compare(transaction1.id, transaction2.id) };
        case (order) { order };
      };
    };
  };

  public type UserProfile = {
    name : Text;
  };

  public type CashflowInsights = {
    averageMonthlyIncome : Nat;
    averageMonthlyExpense : Nat;
    monthOverMonthIncomeChange : Int;
    monthOverMonthExpenseChange : Int;
    largestExpenseCategoryCurrentMonth : ?Text;
    endOfMonthBalanceForecast : Int;
    healthIndicator : { #Safe; #Warning; #Overspending };
  };

  public type PaginatedCategories = {
    items : [Category];
    total : Nat;
    page : Nat;
    pageSize : Nat;
  };

  public type PaginatedTransactions = {
    items : [Transaction];
    total : Nat;
    page : Nat;
    pageSize : Nat;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let userCategories = Map.empty<Principal, Map.Map<Text, Category>>();
  let userTransactions = Map.empty<Principal, Map.Map<Text, Transaction>>();
  let userReceipts = Map.empty<Principal, Map.Map<Text, Blob>>();

  func getUserCategoriesMap(user : Principal) : Map.Map<Text, Category> {
    switch (userCategories.get(user)) {
      case (?map) { map };
      case (null) {
        let newMap = Map.empty<Text, Category>();
        userCategories.add(user, newMap);
        newMap;
      };
    };
  };

  func getUserTransactionsMap(user : Principal) : Map.Map<Text, Transaction> {
    switch (userTransactions.get(user)) {
      case (?map) { map };
      case (null) {
        let newMap = Map.empty<Text, Transaction>();
        userTransactions.add(user, newMap);
        newMap;
      };
    };
  };

  func getUserReceiptsMap(user : Principal) : Map.Map<Text, Blob> {
    switch (userReceipts.get(user)) {
      case (?map) { map };
      case (null) {
        let newMap = Map.empty<Text, Blob>();
        userReceipts.add(user, newMap);
        newMap;
      };
    };
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Category Management (CRUD)
  public shared ({ caller }) func addCategory(category : Category) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add categories");
    };
    let categoriesMap = getUserCategoriesMap(caller);
    categoriesMap.add(category.id, category);
  };

  public shared ({ caller }) func updateCategory(category : Category) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update categories");
    };
    let categoriesMap = getUserCategoriesMap(caller);
    switch (categoriesMap.get(category.id)) {
      case (?_) { categoriesMap.add(category.id, category) };
      case (null) { Runtime.trap("Category not found") };
    };
  };

  public shared ({ caller }) func deleteCategory(categoryId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete categories");
    };
    let categoriesMap = getUserCategoriesMap(caller);
    categoriesMap.remove(categoryId);
  };

  public query ({ caller }) func getCategory(categoryId : Text) : async ?Category {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view categories");
    };
    let categoriesMap = getUserCategoriesMap(caller);
    categoriesMap.get(categoryId);
  };

  public query ({ caller }) func getCategoriesSortedByColor() : async [Category] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view categories");
    };
    let categoriesMap = getUserCategoriesMap(caller);
    categoriesMap.values().toArray().sort(Category.compareByColor);
  };

  public query ({ caller }) func getCategoriesByType() : async [Category] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view categories");
    };
    let categoriesMap = getUserCategoriesMap(caller);
    categoriesMap.values().toArray().sort(Category.compareByType);
  };

  public query ({ caller }) func getCategories(page : Nat, pageSize : Nat) : async PaginatedCategories {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view categories");
    };
    let categoriesMap = getUserCategoriesMap(caller);
    let allCategories = categoriesMap.values().toArray();

    let total = allCategories.size();
    let start = page * pageSize;
    let end = Nat.min(start + pageSize, total);

    let items = if (start >= total) {
      [];
    } else {
      Array.tabulate(end - start, func(i) { allCategories[start + i] });
    };

    {
      items;
      total;
      page;
      pageSize;
    };
  };

  // Transaction Management (CRUD)
  public shared ({ caller }) func addTransaction(transaction : Transaction) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add transactions");
    };
    let transactionsMap = getUserTransactionsMap(caller);
    transactionsMap.add(transaction.id, transaction);
  };

  public shared ({ caller }) func updateTransaction(transaction : Transaction) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update transactions");
    };
    let transactionsMap = getUserTransactionsMap(caller);
    switch (transactionsMap.get(transaction.id)) {
      case (?_) { transactionsMap.add(transaction.id, transaction) };
      case (null) { Runtime.trap("Transaction not found") };
    };
  };

  public shared ({ caller }) func deleteTransaction(transactionId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete transactions");
    };
    let transactionsMap = getUserTransactionsMap(caller);
    transactionsMap.remove(transactionId);
  };

  public query ({ caller }) func getTransaction(transactionId : Text) : async ?Transaction {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transactions");
    };
    let transactionsMap = getUserTransactionsMap(caller);
    transactionsMap.get(transactionId);
  };

  public query ({ caller }) func getTransactions(page : Nat, pageSize : Nat) : async PaginatedTransactions {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transactions");
    };
    let transactionsMap = getUserTransactionsMap(caller);
    let allTransactions = transactionsMap.values().toArray();

    let total = allTransactions.size();
    let start = page * pageSize;
    let end = Nat.min(start + pageSize, total);

    let items = if (start >= total) {
      [];
    } else {
      Array.tabulate(end - start, func(i) { allTransactions[start + i] });
    };

    {
      items;
      total;
      page;
      pageSize;
    };
  };

  public query ({ caller }) func searchTransactions(searchTerm : Text, page : Nat, pageSize : Nat) : async PaginatedTransactions {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can search transactions");
    };
    let transactionsMap = getUserTransactionsMap(caller);
    let allTransactions = transactionsMap.values().toArray();

    let filtered = allTransactions.filter(
      func(t) {
        t.note.contains(#text searchTerm) or t.categoryId.contains(#text searchTerm);
      }
    );

    let total = filtered.size();
    let start = page * pageSize;
    let end = Nat.min(start + pageSize, total);

    let items = if (start >= total) {
      [];
    } else {
      Array.tabulate(end - start, func(i) { filtered[start + i] });
    };

    {
      items;
      total;
      page;
      pageSize;
    };
  };

  public query ({ caller }) func getTransactionsByType(transactionType : CategoryType, page : Nat, pageSize : Nat) : async PaginatedTransactions {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can filter transactions");
    };
    let transactionsMap = getUserTransactionsMap(caller);
    let allTransactions = transactionsMap.values().toArray();

    let filtered = allTransactions.filter(
      func(t) { t.transactionType == transactionType }
    );

    let total = filtered.size();
    let start = page * pageSize;
    let end = Nat.min(start + pageSize, total);

    let items = if (start >= total) {
      [];
    } else {
      Array.tabulate(end - start, func(i) { filtered[start + i] });
    };

    {
      items;
      total;
      page;
      pageSize;
    };
  };

  public query ({ caller }) func getTransactionsByCategory(categoryId : Text, page : Nat, pageSize : Nat) : async PaginatedTransactions {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can filter transactions");
    };
    let transactionsMap = getUserTransactionsMap(caller);
    let allTransactions = transactionsMap.values().toArray();

    let filtered = allTransactions.filter(
      func(t) { t.categoryId == categoryId }
    );

    let total = filtered.size();
    let start = page * pageSize;
    let end = Nat.min(start + pageSize, total);

    let items = if (start >= total) {
      [];
    } else {
      Array.tabulate(end - start, func(i) { filtered[start + i] });
    };

    {
      items;
      total;
      page;
      pageSize;
    };
  };

  // Receipt Management
  public shared ({ caller }) func uploadReceipt(receiptId : Text, imageData : Blob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload receipts");
    };

    if (imageData.size() > 5242880) {
      Runtime.trap("Receipt image exceeds 5MB size limit");
    };

    let receiptsMap = getUserReceiptsMap(caller);
    receiptsMap.add(receiptId, imageData);
  };

  public query ({ caller }) func getReceipt(receiptId : Text) : async ?Blob {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view receipts");
    };
    let receiptsMap = getUserReceiptsMap(caller);
    receiptsMap.get(receiptId);
  };

  public shared ({ caller }) func deleteReceipt(receiptId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete receipts");
    };
    let receiptsMap = getUserReceiptsMap(caller);
    receiptsMap.remove(receiptId);
  };

  // Analytics and Insights
  public query ({ caller }) func getCashflowInsights() : async CashflowInsights {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view insights");
    };

    let transactionsMap = getUserTransactionsMap(caller);
    let allTransactions = transactionsMap.values().toArray();

    var totalIncome : Nat = 0;
    var totalExpense : Nat = 0;
    var incomeCount : Nat = 0;
    var expenseCount : Nat = 0;

    var currentMonthIncome : Nat = 0;
    var currentMonthExpense : Nat = 0;
    var previousMonthIncome : Nat = 0;
    var previousMonthExpense : Nat = 0;

    let categoryExpenses = Map.empty<Text, Nat>();

    let currentTime = Int.abs(Time.now());
    let monthInNanos : Nat = 30 * 24 * 60 * 60 * 1_000_000_000;
    let currentMonthStart = currentTime - (currentTime % monthInNanos);
    let previousMonthStart = currentMonthStart - monthInNanos;

    for (transaction in allTransactions.vals()) {
      let txTime = Int.abs(transaction.date);

      switch (transaction.transactionType) {
        case (#income) {
          totalIncome += transaction.amount;
          incomeCount += 1;

          if (txTime >= currentMonthStart) {
            currentMonthIncome += transaction.amount;
          } else if (txTime >= previousMonthStart and txTime < currentMonthStart) {
            previousMonthIncome += transaction.amount;
          };
        };
        case (#expense) {
          totalExpense += transaction.amount;
          expenseCount += 1;

          if (txTime >= currentMonthStart) {
            currentMonthExpense += transaction.amount;

            let currentCategoryTotal = switch (categoryExpenses.get(transaction.categoryId)) {
              case (?value) { value };
              case (null) { 0 };
            };
            categoryExpenses.add(transaction.categoryId, currentCategoryTotal + transaction.amount);
          } else if (txTime >= previousMonthStart and txTime < currentMonthStart) {
            previousMonthExpense += transaction.amount;
          };
        };
      };
    };

    let avgMonthlyIncome = if (incomeCount > 0) { totalIncome / Nat.max((incomeCount / 30), 1) } else { 0 };
    let avgMonthlyExpense = if (expenseCount > 0) { totalExpense / Nat.max((expenseCount / 30), 1) } else { 0 };

    let incomeChange = if (previousMonthIncome > 0) {
      ((currentMonthIncome : Int) - (previousMonthIncome : Int)) * 100 / (previousMonthIncome : Int);
    } else { 0 };

    let expenseChange = if (previousMonthExpense > 0) {
      ((currentMonthExpense : Int) - (previousMonthExpense : Int)) * 100 / (previousMonthExpense : Int);
    } else { 0 };

    var largestCategory : ?Text = null;
    var largestAmount : Nat = 0;

    for ((categoryId, amount) in categoryExpenses.entries()) {
      if (amount > largestAmount) {
        largestAmount := amount;
        largestCategory := ?categoryId;
      };
    };

    let forecast = (currentMonthIncome : Int) - (currentMonthExpense : Int);

    let healthIndicator = if (currentMonthExpense > currentMonthIncome) {
      #Overspending;
    } else if (currentMonthExpense > (currentMonthIncome * 80 / 100)) {
      #Warning;
    } else {
      #Safe;
    };

    {
      averageMonthlyIncome = avgMonthlyIncome;
      averageMonthlyExpense = avgMonthlyExpense;
      monthOverMonthIncomeChange = incomeChange;
      monthOverMonthExpenseChange = expenseChange;
      largestExpenseCategoryCurrentMonth = largestCategory;
      endOfMonthBalanceForecast = forecast;
      healthIndicator = healthIndicator;
    };
  };
};
