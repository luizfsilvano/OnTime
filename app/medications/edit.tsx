import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { emitUpdatedMedication } from "../lib/medicationEvent"; // ajuste o caminho se necessário

declare global {
  var __medications: Medication[] | undefined;
}

type Medication = {
  id: string;
  name: string;
  intervalHours: number;
  firstDoseTime: string;
  lastTaken: string;
};

export default function EditMedication() {
  const router = useRouter();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [selected, setSelected] = useState<Medication | null>(null);

  useEffect(() => {
    // Simples persistência local para editar apenas os já exibidos
    // Alternativa: usar context/global state se preferir
    const unsub = globalThis.__medications;
    if (Array.isArray(unsub)) setMedications(unsub);
  }, []);

  const handleUpdate = () => {
    if (!selected) return;

    if (!selected.name || !selected.firstDoseTime || !selected.intervalHours) {
      Alert.alert("Preencha todos os campos.");
      return;
    }

    emitUpdatedMedication(selected);
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Medicação</Text>

      {selected ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Nome"
            value={selected.name}
            onChangeText={(text) => setSelected({ ...selected, name: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="1ª dose (08:00)"
            value={selected.firstDoseTime}
            onChangeText={(text) =>
              setSelected({ ...selected, firstDoseTime: text })
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Intervalo (em horas)"
            keyboardType="numeric"
            value={selected.intervalHours.toString()}
            onChangeText={(text) =>
              setSelected({ ...selected, intervalHours: parseInt(text) || 0 })
            }
          />
          <TouchableOpacity style={styles.button} onPress={handleUpdate}>
            <Text style={styles.buttonText}>Salvar Alterações</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.cancel]}
            onPress={() => setSelected(null)}
          >
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </>
      ) : (
        <FlatList
          data={medications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => setSelected(item)}
            >
              <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
              <Text>
                Intervalo: {item.intervalHours}h | 1ª dose: {item.firstDoseTime}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  card: {
    padding: 14,
    backgroundColor: "#eee",
    borderRadius: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#007aff",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  cancel: {
    backgroundColor: "#aaa",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
