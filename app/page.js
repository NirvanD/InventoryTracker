'use client'
import Image from "next/image";
import { useState, useEffect } from "react";
import { firestore, app } from "@/firebase";
import { Box, Typography, Modal, Stack, TextField, Button, IconButton } from "@mui/material";
import { collection, query, getDocs, getDoc, setDoc, doc, deleteDoc } from "firebase/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth"

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [searchText, setSearchText] = useState("")
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [user, setUser] = useState(null)
  const auth = getAuth(app)

  const updateInventory = async (u) => {
    if (!u || !u.email) {
      return;
    }

    const userInventoryRef = collection(firestore, 'users', u.email, 'inventory');
    const inventorySnapshot = await getDocs(userInventoryRef);

    const inventoryList = [];
    inventorySnapshot.forEach((itemDoc) => {
      inventoryList.push({
        id: itemDoc.id,
        ...itemDoc.data()
      });
    });

    setInventory(inventoryList);
  }

  const addItem = async (item) => {
    if (!user || !user.email) {
      return;
    }

    const docRef = doc(collection(firestore, 'users', user.email, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }

    await updateInventory(user);
  }

  const removeItem = async (item) => {
    if (!user || !user.email) {
      return;
    }

    const docRef = doc(collection(firestore, 'users', user.email, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity == 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }

    await updateInventory(user);
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        updateInventory(user);
        setUser(user);
      } else {
        setUser(null);
        setInventory([]);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  const signInWithGoogle = async () => {
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google:", error.message);
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setInventory([]);
    } catch (error) {
      console.error("Error signing out:", error.message);
    }
  }

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const applyFilter = () => {
    return inventory.filter(item => item.id.toLowerCase().includes(searchText.toLowerCase()));
  }

  const filteredItems = applyFilter();

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap={5}
    >
      <Box
        width="90%"
        justifyContent="space-between"
        flexDirection="row"
        display="flex"
        sx={{
          marginTop: "20px"
        }}
      >
        <Typography variant="h4">
          {user ? ("Hello " + user.displayName + "!") : "Sign in to View and Add Items!"}
        </Typography>
        {user ? (
          <Button variant="contained" onClick={handleLogout}>
            Logout
          </Button>
        ) : (
          <Button
            onClick={signInWithGoogle}
            variant="contained"
          >
            Sign In With Google
          </Button>
        )}
      </Box>
      <Modal open={open} onClose={handleClose}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width={400}
          bgcolor="white"
          border="2px solid black"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: "translate(-50%, -50%)"
          }}
        >
          <Typography variant="h6"> Add Item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              variant='outlined'
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            ></TextField>
            <Button
              onClick={() => {
                addItem(itemName);
                setItemName('');
                handleClose();
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Box border='1px solid #333'>
        <Box
          width="800px"
          height="100px"
          bgcolor="#37c0ed"
          alignItems="center"
          justifyContent="center"
          display="flex"
          flexDirection="row"
          padding="35px"
        >
          <Typography variant="h2" color='#333' textAlign="center">
            Inventory Items
          </Typography>
        </Box>
        <Box
          width="800px"
          height="100px"
          bgcolor="#ADD8E6"
          alignItems="center"
          display="flex"
          flexDirection="row"
          padding="35px"
          gap={3}
        >
          <Box width="565px">
            <TextField
              variant='outlined'
              fullWidth
              value={searchText}
              label="Search for an item"
              onChange={(e) => setSearchText(e.target.value)}
            ></TextField>
          </Box>
          <Button
            variant="contained"
            width="150px"
            onClick={handleOpen}
            disabled={user ? false : true}
          >
            Add New Item
          </Button>
        </Box>
        <Stack width="800px" height="300px" spacing={2} overflow="auto">
          {filteredItems.map(({ id, quantity }) => (
            <Box
              key={id}
              width="100%"
              minHeight="150px"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              bgcolor='#f0f0f0'
              padding={5}
            >
              <Typography variant="h3" color="#333" textAlign="center">
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </Typography>
              <Typography variant="h3" color="#333" textAlign="center">
                {quantity}
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button variant="contained" onClick={() => addItem(id)}>
                  Add
                </Button>
                <Button variant="contained" onClick={() => removeItem(id)}>
                  Remove
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  )
}
