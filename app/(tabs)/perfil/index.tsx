import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Colors } from "../../../constants/theme";
import { useAuth } from "../../../contexts/auth-context";
import { getInitials } from "../../../utils/get-initials";

const menuItems = [
  { icon: "edit", label: "Editar perfil" },
  { icon: "location-on", label: "Meu endereço" },
  { icon: "notifications", label: "Notificações" },
  { icon: "payment", label: "Formas de pagamento" },
  { icon: "history", label: "Histórico de serviços" },
  { icon: "help-outline", label: "Ajuda e suporte" },
  { icon: "logout", label: "Sair" },
];

export default function PerfilScreen() {
  const router = useRouter();
  const { user, logout, updateProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [senha, setSenha] = useState("");
  const [rua, setRua] = useState(user?.endereco?.rua ?? "");
  const [numero, setNumero] = useState(user?.endereco?.numero ?? "");
  const [bairro, setBairro] = useState(user?.endereco?.bairro ?? "");
  const [cidade, setCidade] = useState(user?.endereco?.cidade ?? "");
  const [estado, setEstado] = useState(user?.endereco?.estado ?? "");
  const [cep, setCep] = useState(user?.endereco?.cep ?? "");

  function startEditing() {
    setEmail(user?.email ?? "");
    setSenha("");
    setRua(user?.endereco?.rua ?? "");
    setNumero(user?.endereco?.numero ?? "");
    setBairro(user?.endereco?.bairro ?? "");
    setCidade(user?.endereco?.cidade ?? "");
    setEstado(user?.endereco?.estado ?? "");
    setCep(user?.endereco?.cep ?? "");
    setError("");
    setIsEditing(true);
  }

  function cancelEditing() {
    setError("");
    setIsEditing(false);
  }

  async function saveEditing() {
    if (!email.trim()) {
      setError("Informe o e-mail.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const temEndereco = [rua, numero, bairro, cidade, estado, cep].some((campo) => campo.trim());
      await updateProfile({
        email: email.trim(),
        senha: senha.trim() ? senha.trim() : null,
        endereco: temEndereco
          ? {
              rua: rua.trim(),
              numero: numero.trim(),
              bairro: bairro.trim(),
              cidade: cidade.trim(),
              estado: estado.trim(),
              cep: cep.trim(),
            }
          : null,
      });
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar as alterações.");
    } finally {
      setSaving(false);
    }
  }

  async function handleMenuPress(label: string) {
    if (label === "Editar perfil") {
      startEditing();
      return;
    }
    if (label === "Sair") {
      await logout();
      router.replace("/login");
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(user?.nome, user?.sobrenome)}</Text>
          </View>
          <Text style={styles.name}>
            {user ? `${user.nome} ${user.sobrenome}` : "Visitante"}
          </Text>
          {!isEditing && <Text style={styles.email}>{user?.email ?? ""}</Text>}
        </View>

        {isEditing ? (
          <View style={styles.editCard}>
            <Text style={styles.editTitle}>Editar perfil</Text>

            <Input
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              placeholder="E-mail"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="Nova senha (opcional)"
              value={senha}
              onChangeText={setSenha}
              placeholder="Deixe em branco para não alterar"
              secureTextEntry
            />

            <Text style={styles.editSectionTitle}>Endereço</Text>
            <Input label="Rua" value={rua} onChangeText={setRua} placeholder="Rua" />
            <Input label="Número" value={numero} onChangeText={setNumero} placeholder="Número" />
            <Input label="Bairro" value={bairro} onChangeText={setBairro} placeholder="Bairro" />
            <Input label="Cidade" value={cidade} onChangeText={setCidade} placeholder="Cidade" />
            <Input label="Estado" value={estado} onChangeText={setEstado} placeholder="Estado" />
            <Input label="CEP" value={cep} onChangeText={setCep} placeholder="CEP" />

            {error ? <Text style={styles.editError}>{error}</Text> : null}

            <View style={styles.editActions}>
              <Button
                title="Cancelar"
                variant="outline"
                style={styles.editActionButton}
                onPress={cancelEditing}
                disabled={saving}
              />
              <Button
                title="Salvar"
                loading={saving}
                style={styles.editActionButton}
                onPress={saveEditing}
                disabled={saving}
              />
            </View>
          </View>
        ) : (
          <>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>14</Text>
                <Text style={styles.statLabel}>Serviços</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>R$ 1.8k</Text>
                <Text style={styles.statLabel}>Gasto total</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>4.8</Text>
                <Text style={styles.statLabel}>Avaliação</Text>
              </View>
            </View>

            <View style={styles.menuCard}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.menuItem, index < menuItems.length - 1 && styles.menuItemBorder]}
                  onPress={() => handleMenuPress(item.label)}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuIconWrapper}>
                    <MaterialIcons
                      name={item.icon as any}
                      size={20}
                      color={item.label === "Sair" ? "#D32F2F" : Colors.primary}
                    />
                  </View>
                  <Text style={[styles.menuLabel, item.label === "Sair" && styles.menuLabelDanger]}>
                    {item.label}
                  </Text>
                  {item.label !== "Sair" && (
                    <MaterialIcons name="chevron-right" size={20} color="#C4C4C4" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  container: {
    paddingBottom: 110,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 44,
    paddingBottom: 36,
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  avatarText: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: "800",
  },
  name: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  email: {
    color: "#FFE5D9",
    fontSize: 13,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.black,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#8A8A8A",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#EFEFEF",
    marginVertical: 4,
  },
  editCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginTop: -20,
    marginBottom: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  editTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.black,
    marginBottom: 16,
  },
  editSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.black,
    marginTop: 4,
    marginBottom: 12,
  },
  editError: {
    color: Colors.error,
    fontSize: 13,
    marginBottom: 8,
  },
  editActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  editActionButton: {
    flex: 1,
  },
  menuCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 18,
    gap: 14,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  menuIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FFF0EB",
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.black,
  },
  menuLabelDanger: {
    color: "#D32F2F",
  },
});
