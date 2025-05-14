import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  setOnNewMedication,
  setOnUpdateMedication,
} from "./lib/medicationEvent"; // ajuste se necessário

type Medication = {
  id: string;
  name: string;
  intervalHours: number;
  firstDoseTime: string;
  lastTaken: string;
};

export default function HomeScreen() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const router = useRouter();

  function simulateAlarm(med: Medication) {
    setTimeout(() => {
      Alert.alert("🔔 Alerta de Medicação", `${med.name} - tome agora!`);
    }, 5000);
  }

  useEffect(() => {
    setOnNewMedication((med) => {
      setMedications((prev) => {
        const alreadyExists = prev.some((m) => m.id === med.id);
        return alreadyExists ? prev : [...prev, med];
      });
      simulateAlarm(med);
    });

    setOnUpdateMedication((updated) => {
      setMedications((prev) =>
        prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m))
      );
    });
  }, []);

  useEffect(() => {
    globalThis.__medications = medications;
  }, [medications]);

  useEffect(() => {
    const now = new Date();
    const checkIfShouldAlert = (med: Medication) => {
      const [startHour, startMinute] = med.firstDoseTime.split(":").map(Number);
      const today = new Date();
      today.setHours(startHour);
      today.setMinutes(startMinute);
      today.setSeconds(0);
      today.setMilliseconds(0);

      for (let i = 0; i < 24; i += med.intervalHours) {
        const doseTime = new Date(today);
        doseTime.setHours(doseTime.getHours() + i);

        const diff = Math.abs(doseTime.getTime() - now.getTime());

        const alreadyTaken =
          med.lastTaken &&
          new Date(med.lastTaken).getTime() === doseTime.getTime();

        if (diff < 1000 * 60 * 5 && !alreadyTaken) return true;
      }
      return false;
    };

    const shouldAlert = medications.some((med) => checkIfShouldAlert(med));

    if (shouldAlert) {
      Alert.alert("Hora da medicação!", "Você tem uma dose agendada agora.");
    }
  }, [medications]);

  const handleToggleTaken = (id: string) => {
    const now = new Date();
    const nearestDose = (med: Medication): string => {
      const [startHour, startMinute] = med.firstDoseTime.split(":").map(Number);
      const firstDose = new Date();
      firstDose.setHours(startHour);
      firstDose.setMinutes(startMinute);
      firstDose.setSeconds(0);
      firstDose.setMilliseconds(0);

      let closest: Date | null = null;
      let minDiff = Infinity;

      for (let i = 0; i < 24; i += med.intervalHours) {
        const dose = new Date(firstDose);
        dose.setHours(dose.getHours() + i);
        const diff = Math.abs(dose.getTime() - now.getTime());

        if (diff < minDiff) {
          minDiff = diff;
          closest = dose;
        }
      }
      return closest?.toISOString() || now.toISOString();
    };

    setMedications((prev) =>
      prev.map((med) =>
        med.id === id ? { ...med, lastTaken: nearestDose(med) } : med
      )
    );
  };

  const isDoseTaken = (med: Medication) => {
    if (!med.lastTaken) return false;

    const last = new Date(med.lastTaken);
    const now = new Date();
    const diffInMs = now.getTime() - last.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    return diffInHours < med.intervalHours;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🕒 OnTime Meds</Text>
      <FlatList
        data={medications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const lastTaken = item.lastTaken
            ? new Date(item.lastTaken).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Nunca";

          return (
            <View style={styles.card}>
              <View>
                <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
                <Text>
                  Intervalo: {item.intervalHours}h | 1ª dose às{" "}
                  {item.firstDoseTime}
                </Text>
                <Text>Última dose: {lastTaken}</Text>
              </View>
              <TouchableOpacity onPress={() => handleToggleTaken(item.id)}>
                <Image
                  source={
                    isDoseTaken(item)
                      ? require("../assets/check.png")
                      : require("../assets/clock.png")
                  }
                  style={styles.icon}
                />
              </TouchableOpacity>
            </View>
          );
        }}
      />

      <View style={styles.buttons}>
        <TouchableOpacity
          onPress={() => router.push("/medications/create")}
          style={styles.button}
        >
          <Text style={styles.buttonText}>+ Medicação</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/medications/edit")}
          style={styles.button}
        >
          <Text style={styles.buttonText}>- Editar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    marginBottom: 10,
    backgroundColor: "#eee",
    borderRadius: 10,
  },
  icon: { width: 32, height: 32 },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  button: {
    padding: 12,
    backgroundColor: "#007aff",
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
