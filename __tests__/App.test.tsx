/**
 * @format
 */

import React from 'react';
import ReactTestRenderer, { act, type ReactTestInstance } from 'react-test-renderer';
import App from '../App';

jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});

async function renderSignedIn() {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });
  const root = renderer!.root;
  await act(() => {
    root.findByProps({ testID: 'username_input' }).props.onChangeText('demo');
  });
  await act(() => {
    root.findByProps({ testID: 'password_input' }).props.onChangeText('demo1234');
  });
  await act(() => {
    root.findByProps({ testID: 'signin_button' }).props.onPress();
  });
  return root;
}

function findProductCards(root: ReactTestInstance) {
  const matches = root.findAll(
    (node) => typeof node.props.testID === 'string' && node.props.testID.startsWith('product_'),
  );
  const seen = new Set<string>();
  return matches.filter((node) => {
    const testID = node.props.testID as string;
    if (seen.has(testID)) {
      return false;
    }
    seen.add(testID);
    return true;
  });
}

describe('Products screen search', () => {
  test('shows all 3 product cards for an empty query', async () => {
    const root = await renderSignedIn();
    expect(findProductCards(root)).toHaveLength(3);
    expect(() => root.findByProps({ testID: 'empty_text' })).toThrow();
  });

  test('typing a case-insensitive substring match narrows the list to matching cards', async () => {
    const root = await renderSignedIn();
    await act(() => {
      root.findByProps({ testID: 'search_input' }).props.onChangeText('ESP');
    });
    const cards = findProductCards(root);
    expect(cards).toHaveLength(1);
    expect(cards[0].props.testID).toBe('product_p1');
  });

  test('a query matching nothing hides all cards and shows empty_text', async () => {
    const root = await renderSignedIn();
    await act(() => {
      root.findByProps({ testID: 'search_input' }).props.onChangeText('xyz');
    });
    expect(findProductCards(root)).toHaveLength(0);
    const emptyText = root.findByProps({ testID: 'empty_text' });
    expect(emptyText.props.children).toBe('No products match');
  });

  test('deleting back to a matching query restores the cards and removes empty_text', async () => {
    const root = await renderSignedIn();
    await act(() => {
      root.findByProps({ testID: 'search_input' }).props.onChangeText('xyz');
    });
    expect(findProductCards(root)).toHaveLength(0);

    await act(() => {
      root.findByProps({ testID: 'search_input' }).props.onChangeText('');
    });
    expect(findProductCards(root)).toHaveLength(3);
    expect(() => root.findByProps({ testID: 'empty_text' })).toThrow();
  });

  test('other Products screen controls stay unaffected by the search box', async () => {
    const root = await renderSignedIn();
    await act(() => {
      root.findByProps({ testID: 'search_input' }).props.onChangeText('esp');
    });
    expect(root.findByProps({ testID: 'products_title' }).props.children).toBe('Products');
    expect(root.findByProps({ testID: 'welcome_text' }).props.children).toEqual(['Welcome, ', 'demo']);
    expect(root.findByProps({ testID: 'signout_button' })).toBeTruthy();
  });
});

describe('Products screen search clear button', () => {
  test('is absent when the query is empty', async () => {
    const root = await renderSignedIn();
    expect(() => root.findByProps({ testID: 'search_clear_button' })).toThrow();
  });

  test('appears after typing a query, including one that matches nothing', async () => {
    const root = await renderSignedIn();
    await act(() => {
      root.findByProps({ testID: 'search_input' }).props.onChangeText('xyz');
    });
    const clearButton = root.findByProps({ testID: 'search_clear_button' });
    expect(clearButton.props.accessibilityLabel).toBeTruthy();
  });

  test('pressing it clears a narrowed query and restores all 3 cards', async () => {
    const root = await renderSignedIn();
    await act(() => {
      root.findByProps({ testID: 'search_input' }).props.onChangeText('esp');
    });
    await act(() => {
      root.findByProps({ testID: 'search_clear_button' }).props.onPress();
    });
    expect(root.findByProps({ testID: 'search_input' }).props.value).toBe('');
    expect(findProductCards(root)).toHaveLength(3);
    expect(() => root.findByProps({ testID: 'empty_text' })).toThrow();
  });

  test('pressing it clears a no-match query and restores all 3 cards', async () => {
    const root = await renderSignedIn();
    await act(() => {
      root.findByProps({ testID: 'search_input' }).props.onChangeText('xyz');
    });
    await act(() => {
      root.findByProps({ testID: 'search_clear_button' }).props.onPress();
    });
    expect(root.findByProps({ testID: 'search_input' }).props.value).toBe('');
    expect(findProductCards(root)).toHaveLength(3);
    expect(() => root.findByProps({ testID: 'empty_text' })).toThrow();
  });

  test('disappears when the query is deleted manually', async () => {
    const root = await renderSignedIn();
    await act(() => {
      root.findByProps({ testID: 'search_input' }).props.onChangeText('esp');
    });
    expect(() => root.findByProps({ testID: 'search_clear_button' })).not.toThrow();
    await act(() => {
      root.findByProps({ testID: 'search_input' }).props.onChangeText('');
    });
    expect(() => root.findByProps({ testID: 'search_clear_button' })).toThrow();
  });
});

function orderedTestIDs(root: ReactTestInstance) {
  const ids: string[] = [];
  root.findAll((node) => typeof node.props.testID === 'string').forEach((node) => {
    const testID = node.props.testID as string;
    if (ids[ids.length - 1] !== testID) {
      ids.push(testID);
    }
  });
  return ids;
}

describe('CLI validation marker', () => {
  test('renders exactly one marker with its text, testID and accessibilityLabel', async () => {
    const root = await renderSignedIn();
    const markers = root.findAllByProps({ testID: 'cli-validation-marker' }, { deep: false });
    expect(markers).toHaveLength(1);
    expect(markers[0].props.children).toBe('CLI validation');
    expect(markers[0].props.accessibilityLabel).toBe('cli-validation-marker');
  });

  test('sits directly between welcome_text and search_input', async () => {
    const root = await renderSignedIn();
    const ids = orderedTestIDs(root);
    const index = ids.indexOf('cli-validation-marker');
    expect(index).toBeGreaterThan(0);
    expect(ids[index - 1]).toBe('welcome_text');
    expect(ids[index + 1]).toBe('search_input');
  });

  test.each(['', 'esp', 'xyz'])('stays rendered for the query %p', async (query) => {
    const root = await renderSignedIn();
    await act(() => {
      root.findByProps({ testID: 'search_input' }).props.onChangeText(query);
    });
    const markers = root.findAllByProps({ testID: 'cli-validation-marker' }, { deep: false });
    expect(markers).toHaveLength(1);
    expect(markers[0].props.children).toBe('CLI validation');
  });

  test('is not rendered on the Sign in screen', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(() => {
      renderer = ReactTestRenderer.create(<App />);
    });
    const root = renderer!.root;
    expect(root.findByProps({ testID: 'signin_screen' })).toBeTruthy();
    expect(root.findAllByProps({ testID: 'cli-validation-marker' })).toHaveLength(0);
  });

  test('is not rendered on the Product detail screen', async () => {
    const root = await renderSignedIn();
    await act(() => {
      root.findByProps({ testID: 'product_p1' }).props.onPress();
    });
    expect(root.findByProps({ testID: 'detail_title' }).props.children).toBe('Espresso');
    expect(root.findAllByProps({ testID: 'cli-validation-marker' })).toHaveLength(0);
  });
});
