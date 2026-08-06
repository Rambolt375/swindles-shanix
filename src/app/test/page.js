// "use client";
// import { useState } from "react";
// import { useEffect } from "react";
// import { supabase } from "../../utils/supabase";

// export default function Test() {
//   const [int, setInt] = useState(0);

//   return (
//     <div>
//       <h1 className="text-2xl font-bold">Test</h1>
//       <br />
//       <p className="text-xl font-bold">{int.toFixed(2)}</p>
//       <br />
//       <button
//         onClick={() => setInt(int + 0.1)}
//         className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
//       >
//         Increase
//       </button>
//       <button
//         onClick={() => setInt(int - 1)}
//         className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded ml-2"
//       >
//         Decrease
//       </button>
//     </div>
//   );

//   const [string, setString] = useState("");

//   return (
//     <div>
//       <h1 className="text-2xl font-bold">Test</h1>
//       <br />
//       <p className="text-xl font-bold">{string}</p>
//       <br />
//       <button
//         onClick={() => setString(string + "F-16")}
//         className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
//       >
//         Increase
//       </button>
//       <button
//         onClick={() => setString("F-15")}
//         className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
//       >
//         Increase
//       </button>
//       <button
//         onClick={() => setString(string.slice(0, -1))}
//         className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded ml-2"
//       >
//         Decrease
//       </button>
//     </div>
//   );

//   // 1. STRING STATE
//   const [title, setTitle] = useState("My Dashboard");

//   // 2. ARRAY STATE
//   const [categories, setCategories] = useState(["Food", "Transport"]);

//   // 3. OBJECT STATE
//   const [user, setUser] = useState({ name: "Rambolt375", role: "Admin" });

//   return (
//     <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
//       <h1>State Data Types Sandbox</h1>
//       <hr />

//       {/* --- STRING TEST --- */}
//       <section>
//         <h3>1. String Test</h3>
//         <p>
//           Current Title: <strong>{title}</strong>
//         </p>
//         <input
//           type="text"
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//         />
//       </section>

//       <hr />

//       {/* --- ARRAY TEST --- */}
//       <section>
//         <h3>2. Array Test (No .push allowed!)</h3>
//         <p>Categories: {categories.join(", ")}</p>
//         <button onClick={() => setCategories([...categories, "New Item"])}>
//           Add "New Item" to Array
//         </button>
//         <button onClick={() => setCategories([categories])}>Clear Array</button>
//       </section>

//       <hr />

//       {/* --- OBJECT TEST --- */}
//       <section>
//         <h3>3. Object Test</h3>
//         <p>
//           Name: <strong>{user.name}</strong> | Role:{" "}
//           <strong>{user.role}</strong>
//         </p>

//         <button onClick={() => setUser({ ...user, name: "SuperRambolt" })}>
//           Change Name (Keep Role)
//         </button>

//         <button onClick={() => setUser({ ...user, role: "Super User" })}>
//           Change Role (Keep Name)
//         </button>
//         <button
//           onClick={() =>
//             setUser({ ...user, name: "SuperRambolt", role: "Super User" })
//           }
//         >
//           Change Both Name and Role
//         </button>
//       </section>
//     </div>
//   );

//   // 1. BOOLEAN: Is the form visible?
//   const [isFormOpen, setIsFormOpen] = useState(false);

//   // 2. STRING: What is the name of the item?
//   const [idkName, setidkName] = useState("");

//   // 3. NUMBER: How much did it cost?
//   const [itemPrice, setItemPrice] = useState(0);

//   // 4. ARRAY (of Objects): The final list of saved transactions
//   const [transactions, setTransactions] = useState([]);

//   // The function to tie them all together
//   const handleSave = () => {
//     // 1. Create a new object from the string and number states
//     const newTransaction = { name: idkName, price: itemPrice };

//     // 2. Add it to the array
//     setTransactions([...transactions, newTransaction]);

//     // 3. Reset the string and number back to default
//     setidkName("");
//     setItemPrice(0);

//     // 4. Flip the boolean to close the menu!
//     setIsFormOpen(false);
//   };

//   return (
//     <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
//       <h1>Money Tracker Logic</h1>
//       <hr />

//       {/* --- THE TOGGLE (BOOLEAN) --- */}
//       <button onClick={() => setIsFormOpen(!isFormOpen)}>
//         {isFormOpen ? "Cancel" : "+ Add New Expense"}
//       </button>

//       {/* --- THE FORM (STRING & NUMBER) --- */}
//       {isFormOpen && (
//         <div style={{ background: "#eee", padding: "10px", marginTop: "10px" }}>
//           <label>Item Name (String): </label>
//           <input
//             type="text"
//             value={idkName}
//             onChange={(e) => setidkName(e.target.value)}
//           />
//           <br />
//           <br />

//           <label>Price (Number): </label>
//           <input
//             type="number"
//             value={itemPrice}
//             onChange={(e) => setItemPrice(Number(e.target.value))}
//           />
//           <br />
//           <br />

//           <button onClick={handleSave}>Save Transaction</button>
//         </div>
//       )}

//       <hr />

//       {/* --- THE LIST (ARRAY) --- */}
//       <h2>Transaction History</h2>
//       {transactions.length === 0 ? (
//         <p>No transactions yet.</p>
//       ) : (
//         <ul>
//           {transactions.map((tx, index) => (
//             <li key={index}>
//               <strong>{tx.name}</strong> - Rp {tx.price}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );

//   // --- THE STATE (Already set up for you) ---
//   const [idkName, setidkName] = useState("");
//   const [wishlist, setWishlist] = useState([
//     { id: 1, name: "Mechanical Keyboard", purchased: false },
//     { id: 2, name: "New Mouse", purchased: true },
//   ]);

//   // ==========================================
//   // YOUR TEST BEGINS HERE: Fill in these 3 functions
//   // ==========================================

//   const handleAddItem = () => {
//     // MISSION 1: ADD TO ARRAY (Spread)
//     // 1. Check if 'idkName' is empty. If it is, do nothing (return).
//     // 2. Create a new object. Give it an id of Date.now(), a name of 'idkName', and purchased: false.
//     // 3. Update the wishlist array by spreading the old items and adding your new object.
//     // 4. Clear the 'idkName' state back to "".
//     if (idkName.trim() === "") return;
//     const newItem = {
//       id: Date.now(),
//       name: idkName,
//       purchased: false,
//     };
//     setWishlist([...wishlist, newItem]);
//     setidkName("");
//   };

//   const handleDeleteItem = (idToRemove) => {
//     // MISSION 2: REMOVE FROM ARRAY (Filter)
//     // 1. Update the wishlist array.
//     // 2. Filter it so you ONLY keep the items where item.id does NOT equal idToRemove.
//     setWishlist(wishlist.filter((item) => item.id !== idToRemove));
//   };

//   const handleTogglePurchase = (idToToggle) => {
//     // MISSION 3: UPDATE AN ITEM IN ARRAY (Map)
//     // 1. Update the wishlist array.
//     // 2. Map through the items.
//     // 3. If the item.id matches idToToggle, return a copy of that item with the 'purchased' boolean flipped (!item.purchased).
//     // 4. If it doesn't match, just return the item exactly as it is.
//     setWishlist(
//       wishlist.map((item) =>
//         item.id === idToToggle ? { ...item, purchased: !item.purchased } : item,
//       ),
//     );
//   };

//   // ==========================================
//   // YOUR TEST ENDS HERE
//   // ==========================================

//   // --- THE UI (Don't touch this! I built it for you) ---
//   return (
//     <div
//       style={{ padding: "20px", fontFamily: "sans-serif", maxWidth: "500px" }}
//     >
//       <h1>Final Sandbox Test</h1>
//       <hr />

//       {/* Input Area */}
//       <div style={{ marginBottom: "20px" }}>
//         <input
//           type="text"
//           value={idkName}
//           onChange={(e) => setidkName(e.target.value)}
//           placeholder="New wishlist item..."
//         />
//         <button onClick={handleAddItem}>Add Item</button>
//       </div>

//       {/* List Area */}
//       {wishlist.length === 0 ? (
//         <p>No items in wishlist.</p>
//       ) : (
//         <ul style={{ listStyle: "none", padding: 0 }}>
//           {wishlist.map((item) => (
//             <li
//               key={item.id}
//               style={{
//                 border: "1px solid #ccc",
//                 padding: "10px",
//                 marginBottom: "5px",
//                 display: "flex",
//                 justifyContent: "space-between",
//                 background: item.purchased ? "#e6ffe6" : "#fff",
//               }}
//             >
//               <span
//                 style={{
//                   textDecoration: item.purchased ? "line-through" : "none",
//                 }}
//               >
//                 {item.name}
//               </span>

//               <div>
//                 <button onClick={() => handleTogglePurchase(item.id)}>
//                   {item.purchased ? "Undo" : "Buy"}
//                 </button>
//                 <button
//                   onClick={() => handleDeleteItem(item.id)}
//                   style={{ color: "red", marginLeft: "5px" }}
//                 >
//                   X
//                 </button>
//               </div>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );

//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // THE USEEFFECT PATTERN
//   useEffect(() => {
//     // 1. Define the fetch function inside the effect
//     const fetchData = async () => {
//       setLoading(true);

//       // Replace 'your_table_name' with your actual table
//       const { data, error } = await supabase.from("accounts").select("balance");

//       if (data) {
//         setData(data);
//       }
//       setLoading(false);
//     };

//     // 2. Call the function
//     fetchData();
//   }, []); // <--- The empty array means "Run this exactly once"

//   if (loading) return <p>Connecting to Supabase...</p>;

//   return (
//     <div>
//       <h1>Data from Supabase:</h1>
//       <pre>{JSON.stringify(data, null, 2)}</pre>
//     </div>
//   );

//   const [items, setItems] = useState(["Coffee"]);
//   const [saveStatus, setSaveStatus] = useState("Synced");

//   // 1. Initial Load (Scenario 1)
//   useEffect(() => {
//     console.log("App loaded. Fetching from database...");
//   }, []);

//   // 2. Auto-Save (Scenario 3)
//   useEffect(() => {
//     setSaveStatus("Saving...");

//     // Simulate database delay
//     const timer = setTimeout(() => {
//       setSaveStatus("Synced");
//     }, 1000);

//     return () => clearTimeout(timer);
//   }, [items]); // WATCHES THE ITEMS ARRAY

//   return (
//     <div>
//       <h1>Auto-Save Sandbox</h1>
//       <p>Status: {saveStatus}</p>
//       <ul>
//         {items.map((item, i) => (
//           <li key={i}>{item}</li>
//         ))}
//       </ul>
//       <button onClick={() => setItems([...items, "New Item"])}>Add Item</button>
//     </div>
//   );
// }
