import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  Keyboard,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Person } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface PeopleManagerProps {
  people: Person[];
  onAddPerson: (name: string) => void;
  onRemovePerson: (personId: string) => void;
  onVoiceInput?: () => void;
}

const PeopleManager: React.FC<PeopleManagerProps> = ({
  people,
  onAddPerson,
  onRemovePerson,
  onVoiceInput,
}) => {
  const { colors } = useTheme();
  const [newPersonName, setNewPersonName] = useState('');

  const handleAddPerson = () => {
    const trimmedName = newPersonName.trim();
    if (!trimmedName) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    if (people.some(person => person.name.toLowerCase() === trimmedName.toLowerCase())) {
      Alert.alert('Error', 'A person with this name already exists');
      return;
    }

    onAddPerson(trimmedName);
    setNewPersonName('');
  };

  const renderPersonItem = ({ item }: { item: Person }) => (
    <View style={styles.personItem}>
      <View style={styles.personInfo}>
        <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
        <Text style={styles.personName}>{item.name}</Text>
      </View>
      <TouchableOpacity
        onPress={() => onRemovePerson(item.id)}
        style={styles.removeButton}
      >
        <Ionicons name="trash-outline" size={20} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Add People</Text>
      <Text style={styles.sectionDescription}>
        Add everyone who will be splitting the bill
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Enter person's name"
          value={newPersonName}
          onChangeText={setNewPersonName}
          onSubmitEditing={handleAddPerson}
          returnKeyType="done"
        />
        <TouchableOpacity
          onPress={handleAddPerson}
          style={styles.addButton}
          disabled={!newPersonName.trim()}
        >
          <Ionicons
            name="add"
            size={24}
            color={newPersonName.trim() ? '#FFFFFF' : '#8E8E93'}
          />
        </TouchableOpacity>
        {onVoiceInput && (
          <TouchableOpacity
            onPress={onVoiceInput}
            style={[styles.addButton, { marginLeft: 8, backgroundColor: '#FF9500' }]}
          >
            <Ionicons name="mic" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {people.length > 0 && (
        <>
          <Text style={styles.peopleCount}>
            {people.length} {people.length === 1 ? 'person' : 'people'} added
          </Text>
          
          <FlatList
            data={people}
            renderItem={renderPersonItem}
            keyExtractor={(item) => item.id}
            style={styles.peopleList}
            scrollEnabled={false}
          />
        </>
      )}

      {people.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={48} color="#C7C7CC" />
          <Text style={styles.emptyStateText}>No people added yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Add people to start splitting the bill
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  textInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    marginRight: 12,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  peopleCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  peopleList: {
    marginBottom: 20,
  },
  personItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  personInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
  },
  personName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    flex: 1,
  },
  removeButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#C7C7CC',
    textAlign: 'center',
  },
});

export default PeopleManager;
