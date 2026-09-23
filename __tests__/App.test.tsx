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
