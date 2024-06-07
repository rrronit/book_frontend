import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TextInput, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SearchBar = ({ onChange }: { onChange: (text: string) => void }) => {
  return (
    <ThemedView style={styles.searchContainer}>
      <TextInput
        placeholder="Search"
        placeholderTextColor="#999"
        style={styles.searchInput}
        onChangeText={onChange}
      />
      <TouchableOpacity style={styles.searchButtonContainer}>
        <ThemedText style={styles.searchButton}>Search</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
};

const PersonItem = ({ person }: { person: Person }) => {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#333' : '#fff';
  const textColor = colorScheme === 'dark' ? '#fff' : '#000';

  return (
    <TouchableOpacity onPress={() => router.push('/person/' + person._id)} style={[styles.personItem, { backgroundColor }]}>
      <View style={styles.personItemContainer}>
        <ThemedText style={[styles.personName, { color: textColor }]}>{person.name}</ThemedText>
        <ThemedText style={[styles.personPhone, { color: textColor }]}>{person.phone}</ThemedText>
      </View>
      <ThemedText style={[styles.personMoney, { color: textColor }]}>{person.money}</ThemedText>
    </TouchableOpacity>
  );
};

type Person = {
  _id: number;
  name: string;
  phone: string;
  money: string;
  sheet: string;
};

export default function HomeScreen() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allPersons, setAllPersons] = useState<Person[]>([]);
  const [filteredPersons, setFilteredPersons] = useState<Person[]>([]);

  const getIsAdmin = async () => {
    const isAdmin = await AsyncStorage.getItem("adminAccess") === "true";
    setIsAdmin(isAdmin);
  }

  useEffect(() => {
    getIsAdmin();
    getPersons();
    setSearchQuery("");
  }, []);

  const getPersons = async () => {
    try {
      const response = await fetch("http://192.168.15.171:3000/api/person/0");
      const persons = await response.json();
      setAllPersons(persons);
      setFilteredPersons(persons);
    } catch (error) {
      console.error('Fetch error: ', error);
    }
  };

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    console.log(text)
    const filtered = allPersons.filter(person => {
      return person.name.toLowerCase().includes(text.toLowerCase()) || person.phone.includes(text);
    });
    setFilteredPersons(filtered);

    if (text === "getAdminAccess") {
      await AsyncStorage.setItem("adminAccess", "true");
      setIsAdmin(true);
    }
    if (text === "logoutAdmin") {
      await AsyncStorage.removeItem("adminAccess");
      setIsAdmin(false);
    }
  };

  const handleAdd = () => {
    router.push('add');
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <SearchBar onChange={handleSearch} />
        {isAdmin && 
          <TouchableOpacity onPress={handleAdd} style={styles.addButton}>
            <ThemedText style={styles.addButtonText}>Add</ThemedText>
          </TouchableOpacity>
        }
        <View style={styles.personList}>
          {filteredPersons.map((person) => (
            <PersonItem key={person._id} person={person} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#F8F8F8', // Lighter background
  },
  container: {
    paddingHorizontal: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginVertical: 10,
    backgroundColor: '#F0F0F0', // Lighter search bar background
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2, // Add shadow for depth
  },
  searchInput: {
    height: 40,
    flex: 1,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFF',
  },
  searchButtonContainer: {
    marginLeft: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  searchButton: {
    fontSize: 16,
    color: '#FFF',
  },
  personList: {
    marginTop: 20,
  },
  personItem: {
    marginBottom: 10,
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  personItemContainer: {
    flex: 1,
  },
  personName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  personPhone: {
    fontSize: 14,
    color: '#888',
  },
  personMoney: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, // Add shadow for depth
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});