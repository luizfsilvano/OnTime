import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import uuid from "react-native-uuid";
import { emitNewMedication } from "../lib/medicationEvent";

export default function CreateMedication() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [intervalHours, setIntervalHours] = useState("");
  const [firstDoseTime, setFirstDoseTime] = useState("");

  const handleCreate = () => {
    if (!name || !intervalHours || !firstDoseTime) {
      Alert.alert("Preencha todos os campos.");
      return;
    }

    const newMedication = {
      id: uuid.v4().toString(),
      name,
      intervalHours: parseInt(intervalHours),
      firstDoseTime,
      lastTaken: "",
    };

    emitNewMedication(newMedication);
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Adicionar Medicação</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome do remédio"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Intervalo (em horas, ex: 8)"
        keyboardType="numeric"
        value={intervalHours}
        onChangeText={setIntervalHours}
      />

      <TextInput
        style={styles.input}
        placeholder="Horário da 1ª dose (ex: 08:00)"
        value={firstDoseTime}
        onChangeText={setFirstDoseTime}
      />

      <TouchableOpacity style={styles.button} onPress={handleCreate}>
        <Text style={styles.buttonText}>Salvar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.cancel]}
        onPress={() => router.back()}
      >
        <Text style={styles.buttonText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
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
