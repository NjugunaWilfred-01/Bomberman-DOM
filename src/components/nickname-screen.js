/**
 * Nickname Input Screen Component
 * Renders the nickname input form before entering the game
 */

import { h } from '../../mini-framework/src/framework.js';

export function renderNicknameScreen(state, callbacks) {
  const { nickname, error, isLoading, connectionStatus } = state;
  
  return h('div', { class: 'nickname-screen' }, [
    h('div', { class: 'nickname-container' }, [
      h('div', { class: 'nickname-header' }, [
        h('h1', { class: 'game-title' }, 'Bomberman DOM'),
        h('p', { class: 'game-subtitle' }, 'Enter your nickname to start playing')
      ]),
      
      h('form', { 
        class: 'nickname-form',
        onsubmit: (e) => {
          e.preventDefault();
          if (callbacks.onSubmit) {
            callbacks.onSubmit(nickname);
          }
        }
      }, [
        h('div', { class: 'input-group' }, [
          h('label', { 
            for: 'nickname-input',
            class: 'input-label' 
          }, 'Nickname'),
          
          h('input', {
            id: 'nickname-input',
            type: 'text',
            class: `nickname-input ${error ? 'nickname-input--error' : ''}`,
            placeholder: 'Enter your nickname...',
            maxlength: '20',
            disabled: isLoading,
            oninput: (e) => {
              if (callbacks.onNicknameChange) {
                callbacks.onNicknameChange(e.target.value);
              }
            },
            onkeydown: (e) => {
              if (e.key === 'Enter' && !isLoading && e.target.value.trim()) {
                e.preventDefault();
                if (callbacks.onSubmit) {
                  callbacks.onSubmit(e.target.value.trim());
                }
              }
            }
          }),
          
          error && h('div', { class: 'error-message' }, error)
        ]),
        
        h('div', { class: 'nickname-requirements' }, [
          h('small', {}, 'Requirements:'),
          h('ul', {}, [
            h('li', {}, '2-20 characters'),
            h('li', {}, 'Letters, numbers, underscore, and dash only'),
            h('li', {}, 'No spaces or special characters')
          ])
        ]),
        
        h('button', {
          type: 'submit',
          class: `nickname-submit ${isLoading ? 'nickname-submit--loading' : ''}`,
          disabled: isLoading || !nickname.trim()
        }, [
          isLoading ? [
            h('span', { class: 'loading-spinner' }),
            ' Connecting...'
          ] : 'Start Game'
        ])
      ]),
      
      h('div', { class: 'connection-status' }, [
        h('div', { 
          class: `status-indicator ${connectionStatus === 'connected' ? 'status-indicator--connected' : 
                                   connectionStatus === 'connecting' ? 'status-indicator--connecting' : 
                                   'status-indicator--offline'}`
        }),
        h('span', { class: 'status-text' }, 
          connectionStatus === 'connected' ? 'Connected to server' :
          connectionStatus === 'connecting' ? 'Connecting to server...' :
          'Offline mode (no server connection)'
        )
      ]),
      
      h('div', { class: 'nickname-footer' }, [
        h('p', {}, 'Use WASD or arrow keys to move, SPACE to place bombs'),
        h('small', {}, 'Made with ❤️ using Mini-Framework')
      ])
    ])
  ]);
}

export function renderLoadingScreen(message = 'Loading...') {
  return h('div', { class: 'loading-screen' }, [
    h('div', { class: 'loading-container' }, [
      h('div', { class: 'loading-spinner loading-spinner--large' }),
      h('p', { class: 'loading-message' }, message)
    ])
  ]);
}
