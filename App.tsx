/**
 * Dijji Mobile Demo
 *
 * A small three-screen app used to try Dijji's on-device mobile E2E flow. No backend, no navigation
 * library: the screens are plain state so the app builds with nothing but the React Native template.
 * Every interactive element carries a testID/accessibilityLabel so Maestro flows can select it.
 *
 * Screens: Sign in -> Products -> Product detail.
 *
 * @format
 */

import { useState } from 'react';
import {
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

type Product = { id: string; name: string; price: number; description: string };

export const PRODUCTS: Product[] = [
  { id: 'p1', name: 'Espresso', price: 45, description: 'Double shot, freshly ground.' },
  { id: 'p2', name: 'Flat White', price: 65, description: 'Espresso with velvety steamed milk.' },
  { id: 'p3', name: 'Cold Brew', price: 70, description: 'Steeped for 18 hours, served over ice.' },
];

/** Demo credentials. The E2E flows read them from the stage target, never from the app. */
export const DEMO_USER = { username: 'demo', password: 'demo1234' };

type Screen = { name: 'signin' } | { name: 'products' } | { name: 'detail'; product: Product };

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Root />
    </SafeAreaProvider>
  );
}

function Root() {
  const [screen, setScreen] = useState<Screen>({ name: 'signin' });
  const [user, setUser] = useState<string | null>(null);

  if (screen.name === 'signin') {
    return (
      <SignInScreen
        onSignedIn={(username) => {
          setUser(username);
          setScreen({ name: 'products' });
        }}
      />
    );
  }
  if (screen.name === 'products') {
    return (
      <ProductsScreen
        user={user ?? ''}
        onOpen={(product) => setScreen({ name: 'detail', product })}
        onSignOut={() => {
          setUser(null);
          setScreen({ name: 'signin' });
        }}
      />
    );
  }
  return <DetailScreen product={screen.product} onBack={() => setScreen({ name: 'products' })} />;
}

function SignInScreen({ onSignedIn }: { onSignedIn: (username: string) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (!username.trim() || !password) {
      setError('Enter your username and password.');
      return;
    }
    if (username.trim() !== DEMO_USER.username || password !== DEMO_USER.password) {
      setError('Wrong username or password.');
      return;
    }
    setError(null);
    onSignedIn(username.trim());
  };

  return (
    <SafeAreaView style={styles.screen} testID="signin_screen">
      <Text style={styles.title} testID="signin_title">
        Sign in
      </Text>
      <Text style={styles.hint}>Demo account: demo / demo1234</Text>
      <TextInput
        testID="username_input"
        accessibilityLabel="Username"
        placeholder="Username"
        autoCapitalize="none"
        autoCorrect={false}
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput
        testID="password_input"
        accessibilityLabel="Password"
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      {error ? (
        <Text style={styles.error} testID="signin_error" accessibilityLabel="Sign in error">
          {error}
        </Text>
      ) : null}
      <Pressable testID="signin_button" accessibilityLabel="Sign in" onPress={submit} style={styles.button}>
        <Text style={styles.buttonText}>Sign in</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function ProductsScreen({
  user,
  onOpen,
  onSignOut,
}: {
  user: string;
  onOpen: (product: Product) => void;
  onSignOut: () => void;
}) {
  const [query, setQuery] = useState('');
  const filteredProducts = PRODUCTS.filter((product) =>
    product.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.screen} testID="products_screen">
      <View style={styles.row}>
        <Text style={styles.title} testID="products_title">
          Products
        </Text>
        <Pressable testID="signout_button" accessibilityLabel="Sign out" onPress={onSignOut}>
          <Text style={styles.link}>Sign out</Text>
        </Pressable>
      </View>
      <Text style={styles.hint} testID="welcome_text">
        Welcome, {user}
      </Text>
      <TextInput
        testID="search_input"
        accessibilityLabel="Search products"
        placeholder="Search products"
        autoCapitalize="none"
        autoCorrect={false}
        value={query}
        onChangeText={setQuery}
        style={styles.input}
      />
      {filteredProducts.length === 0 ? (
        <Text style={styles.hint} testID="empty_text" accessibilityLabel="No products match">
          No products match
        </Text>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              testID={`product_${item.id}`}
              accessibilityLabel={item.name}
              onPress={() => onOpen(item)}
              style={styles.card}
            >
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardPrice}>{item.price} TL</Text>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

function DetailScreen({ product, onBack }: { product: Product; onBack: () => void }) {
  const [quantity, setQuantity] = useState(1);
  return (
    <SafeAreaView style={styles.screen} testID="detail_screen">
      <Pressable testID="back_button" accessibilityLabel="Back" onPress={onBack}>
        <Text style={styles.link}>‹ Back</Text>
      </Pressable>
      <Text style={styles.title} testID="detail_title">
        {product.name}
      </Text>
      <Text style={styles.hint}>{product.description}</Text>
      <View style={styles.row}>
        <Pressable
          testID="decrement_button"
          accessibilityLabel="Decrease quantity"
          onPress={() => setQuantity((q) => Math.max(1, q - 1))}
          style={styles.stepper}
        >
          <Text style={styles.stepperText}>−</Text>
        </Pressable>
        <Text style={styles.quantity} testID="quantity_text" accessibilityLabel={`Quantity ${quantity}`}>
          {quantity}
        </Text>
        <Pressable
          testID="increment_button"
          accessibilityLabel="Increase quantity"
          onPress={() => setQuantity((q) => q + 1)}
          style={styles.stepper}
        >
          <Text style={styles.stepperText}>+</Text>
        </Pressable>
      </View>
      <Text style={styles.total} testID="total_text">
        Total: {product.price * quantity} TL
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 24, gap: 12, backgroundColor: '#ffffff' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  title: { fontSize: 28, fontWeight: '700', color: '#111827' },
  hint: { fontSize: 14, color: '#6b7280' },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
  },
  error: { color: '#b91c1c', fontSize: 14 },
  button: { backgroundColor: '#2563eb', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  link: { color: '#2563eb', fontSize: 16 },
  card: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },
  cardPrice: { fontSize: 18, color: '#374151' },
  stepper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperText: { fontSize: 22, color: '#111827' },
  quantity: { fontSize: 20, fontWeight: '600', color: '#111827', minWidth: 32, textAlign: 'center' },
  total: { fontSize: 20, fontWeight: '700', color: '#111827' },
});

export default App;
