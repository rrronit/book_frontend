import { StyleSheet, Image, View, Text, Linking, TouchableOpacity, Modal, ActivityIndicator, TextInput, Button, ToastAndroid } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import ImageViewer from 'react-native-image-zoom-viewer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

type Person = {
    id: number;
    name: string;
    phone: string;
    money: string;
    sheet: string;
};
export default function Person() {
    const [isAdmin, setIsAdmin] = useState<boolean>(false)
    const getIsAdmin = async () => {
        const isAdmin = await AsyncStorage.getItem("adminAccess") === "true";
        console.log(isAdmin)
        setIsAdmin(isAdmin);
    }
    useEffect(() => {
        getIsAdmin();
    }, []);

    const { id } = useLocalSearchParams();
    const [person, setPerson] = useState<Person | undefined>(undefined);
    const getPerson = async () => {
        const response = await fetch("http://192.168.15.171:3000/api/person/" + id);
        const person: Person | undefined = await response.json();
        setPerson(person);
        console.log(editedName)
        console.log(editedMoney)
    };
    useEffect(() => {

        if (id) { // Ensure id exists before fetching data
            getPerson();
        }
    }, [id]); // Add id as dependency


    const [modalVisible, setModalVisible] = useState(false);
    const [imageModalVisible, setImageModalVisible] = useState(false);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false); // Added for delete confirmation modal

    const [editedName, setEditedName] = useState(person?.name);
    const [editedPhone, setEditedPhone] = useState(person?.phone);
    const [editedMoney, setEditedMoney] = useState(person?.money);
    const [editedImage, setEditedImage] = useState(person?.sheet);


    const convertImageToBase64 = async (imageUri: string) => {
        try {
            // Read the image file from the given URI
            const fileContent = await FileSystem.readAsStringAsync(imageUri, {
                encoding: FileSystem.EncodingType.Base64,
            });
            return fileContent;
        } catch (error) {
            console.log("Error converting image to base64:", error);
            return null;
        }
    };


    const handleSave = async () => {
        let base64Image = editedImage;

        // Check if editedImage is a file path
        if (!editedImage?.startsWith('data:image/')) {
            base64Image = await convertImageToBase64(editedImage || "") as string;
            setEditedImage(base64Image);
        }

        const res = await fetch("http://192.168.15.171:3000/api/person/0", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: id,
                name: editedName,
                phone: editedPhone,
                money: editedMoney,
                image: base64Image,
            }),
        }).then(res => res.json()).then(data => {
            ToastAndroid.show("Saved", ToastAndroid.SHORT);
        }).catch(err => {
            ToastAndroid.show("failed to save", ToastAndroid.SHORT);
        });
        setModalVisible(false);
    };

    const handleDelete = async () => {
        try {
            await fetch(`http://192.168.15.171:3000/api/person/0`, {
                method: "DELETE",
                body: JSON.stringify({
                    id: id,
                }),
            });
            ToastAndroid.show("Person deleted", ToastAndroid.SHORT);
            router.navigate("/");
            // Navigate back to the previous screen or perform any other desired action
        } catch (err) {
            ToastAndroid.show("Failed to delete person", ToastAndroid.SHORT);
        }
    };

    useEffect(() => {
        if (person) {
            setEditedName(person.name);
            setEditedPhone(person.phone);
            setEditedMoney(person.money);
            setEditedImage(person.sheet);
        }
    }, [person]);

    if (!person) {
        return <Text>Not found</Text>;
    }


    const sendMessage =async  () => {
        let message = ""
        await fetch("http://192.168.15.171:3000/api/person/message", {
            method: "GET",
        }).then(res => res.json()).then(data => {
            message = data.message.replace("<paisa>", editedMoney || 0)
            console.log(editedMoney)
    }).catch (err => {
        console.log(err);
    });
    Linking.openURL(`sms:${person.phone}?body=${message}`);
};


const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
        setEditedImage(result.assets[0].uri);
    }
};


return (
    <View style={styles.container}>
        {isAdmin &&
            <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.button}>
                <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
        }
        {isAdmin &&
            <TouchableOpacity
                onPress={() => setConfirmModalVisible(true)}
                style={[styles.button, { backgroundColor: "red" }]}
            >
                <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
        }
        <Text style={styles.name}>{editedName}</Text>
        <Text style={styles.phone}>{editedPhone}</Text>
        <Text style={styles.money}>{editedMoney}</Text>
        <TouchableOpacity onPress={() => setImageModalVisible(true)} style={styles.imageContainer}>
            <Image source={{ uri: `data:image/jpeg;base64,${editedImage}` }} style={styles.image} resizeMode="contain" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => sendMessage()} style={styles.button}>
            <Text style={styles.buttonText}>Send message</Text>
        </TouchableOpacity>

        <Modal
            animationType="slide"
            transparent={false}
            visible={imageModalVisible}
            onRequestClose={() => {
                setImageModalVisible(false);
            }}
        >
            <ImageViewer
                imageUrls={[{ url: `data:image/jpeg;base64,${person.sheet}` }]}
                enableSwipeDown={true}
                onSwipeDown={() => setImageModalVisible(false)}
                enablePreload={true}
                saveToLocalByLongPress={false}
                loadingRender={() => <ActivityIndicator />}
                backgroundColor="black"
                style={{ flex: 1 }}
            />
        </Modal>

        <Modal
            animationType="slide"
            transparent={false}
            visible={modalVisible}
            onRequestClose={() => {
                setModalVisible(false);
            }}
        >
            <View style={styles.modalContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Name"
                    value={editedName}
                    onChangeText={text => setEditedName(text)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Phone"
                    value={editedPhone}
                    onChangeText={text => setEditedPhone(text)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Money"
                    keyboardType="numeric"
                    value={"" + editedMoney}
                    onChangeText={text => setEditedMoney(text)}
                />
                <View style={styles.imageContainer}>
                    <Button title="Pick an image" onPress={pickImage} />
                    {editedImage && <Image source={{ uri: editedImage === person.sheet ? "data:image/jpeg;base64," + editedImage : editedImage }} style={styles.image} />}
                </View>

                <Button title="Save" onPress={() => handleSave()} />
            </View>
        </Modal>
        <Modal
            animationType="slide"
            transparent={true}
            visible={confirmModalVisible}
            onRequestClose={() => setConfirmModalVisible(false)}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalText}>Are you sure you want to delete this person?</Text>
                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={() => setConfirmModalVisible(false)}
                        >
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.deleteButton]}
                            onPress={handleDelete}
                        >
                            <Text style={styles.buttonText}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    </View>
);
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: 'blue',
        padding: 10,
        borderRadius: 5,
        marginTop: 20,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain', // maintain aspect ratio
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f0f0', // light gray background
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 10,
        color: 'black',
    },
    phone: {
        fontSize: 18,
        color: '#333333', // dark gray
    },
    money: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'green',
        marginVertical: 10,
    },
    imageContainer: {
        width: "100%",
        height: 200,
        borderWidth: 2,
        borderColor: 'black',
        marginTop: 20,
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover', // cover the entire container
    },
    input: {
        height: 40,
        borderWidth: 1,
        borderColor: 'gray',
        marginVertical: 10,
        paddingHorizontal: 10,
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)", // semi-transparent black background
    },
    modalView: {
        backgroundColor: "white",
        borderRadius: 10,
        padding: 20,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center",
        fontSize: 16,
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    cancelButton: {
        backgroundColor: "gray",
    },
    deleteButton: {
        backgroundColor: "red",
    },
});
