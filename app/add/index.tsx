import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, Image, StyleSheet, TouchableOpacity, SafeAreaView, ToastAndroid, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { router } from 'expo-router';

const AddPersonScreen = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [money, setMoney] = useState(0);
  const [image, setImage] = useState("");
  

  const handleNameChange = (text: string) => setName(text);
  const handlePhoneChange = (text: string) => setPhone(text);
  const handleMoneyChange = (text: string) => setMoney(parseInt(text));

  const convertImageToBase64 = async (imageUri: string) => {
    try {
      const fileContent = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return fileContent;
    } catch (error) {
      console.log("Error converting image to base64:", error);
      return null;
    }
  };

  const handleAddPerson = async () => {
    if (name === "" || phone === "") {
      ToastAndroid.show("Please fill all fields", ToastAndroid.SHORT);
      return;
    }

    const base64Image = await convertImageToBase64(image);

    fetch('http://192.168.15.171:3000/api/person/0', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, phone, money, image: base64Image }),
    })
      .then(async response => await response.json())
      .then(data => {
        ToastAndroid.show("Person added successfully", ToastAndroid.SHORT);
        setName("");
        setPhone("");
        setMoney(0);
        setImage("");
        router.navigate("/");
      })
      .catch(error => {
        console.log(error);
        ToastAndroid.show("Error adding person", ToastAndroid.SHORT);
      });
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={{fontSize: 20, fontWeight: 'bold', marginBottom: 10}}>Add Person</Text>
      <View style={styles.formContainer}>
        <TextInput
          placeholder="Name"
          onChangeText={handleNameChange}
          value={name}
          style={styles.input}
        />
        <TextInput
          placeholder="Phone"
          onChangeText={handlePhoneChange}
          keyboardType="numeric"
          value={phone}
          style={styles.input}
        />
        <TextInput
          placeholder="Money"
          onChangeText={handleMoneyChange}
          keyboardType="numeric"
          value={`${money}`}
          style={styles.input}
        />
        <View style={styles.imageContainer}>
          <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
            <Image source={{uri: image? image : "https://imgs.search.brave.com/OSowyThj6SRyC-zGTon0oYa0pvJd0bUwgEeeeQLzYEY/rs:fit:860:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzA2Lzk5LzU1Lzkw/LzM2MF9GXzY5OTU1/OTA3OV9GdnV0TkdY/T01nN1NmQlRLSHg5/MlNVaU1mYVZ1OW1P/Vi5qcGc" }} style={styles.image} />
            <Text style={{textAlign:"center"}}>{image ? "Change" : "Pick"}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity >
          <Button color="#007AFF"  title="Add Person" onPress={handleAddPerson} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  formContainer: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: '#F5F5F5',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imageButton: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 5,
    padding: 10,
  },
  image: {
    width: 200,
    height: 200,
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 5,
    paddingVertical: 10,
  },
});

export default AddPersonScreen;