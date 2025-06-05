'use client'

import { useState, useRef, useEffect } from 'react'

export default function SearchableSelect({ 
  options, 
  value, 
  onChange, 
  name = "",
  placeholder = "Select option...",
  className = "",
  style = {},
  required = false 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredOptions, setFilteredOptions] = useState(options)
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    // Filter options based on search term
    if (searchTerm) {
      const filtered = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredOptions(filtered)
    } else {
      setFilteredOptions(options)
    }
  }, [searchTerm, options])

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (option) => {
    // Create a synthetic event that matches what the form expects
    const syntheticEvent = {
      target: { 
        name: name, // Use the passed name prop
        value: option.value 
      }
    }
    onChange(syntheticEvent)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleInputChange = (e) => {
    const newValue = e.target.value
    setSearchTerm(newValue)
    
    // If user starts typing, clear the selection so they can search freely
    if (newValue && selectedOption) {
      // Clear the form value to allow fresh search
      const syntheticEvent = {
        target: { 
          name: name,
          value: ''
        }
      }
      onChange(syntheticEvent)
    }
    
    if (!isOpen) {
      setIsOpen(true)
    }
  }

  const handleKeyDown = (e) => {
    // When user starts typing or pressing backspace, allow free editing
    if (e.key === 'Backspace' || e.key === 'Delete') {
      if (selectedOption && searchTerm === '') {
        // If there's a selection and no search term, start fresh search
        setSearchTerm('')
        const syntheticEvent = {
          target: { 
            name: name,
            value: ''
          }
        }
        onChange(syntheticEvent)
      }
    }
  }

  const selectedOption = options.find(opt => opt.value === value)

  return (
    <div className={`relative ${className}`} ref={dropdownRef} style={style}>
      {/* Main Search Input */}
      <input
        ref={inputRef}
        type="text"
        className="input w-full"
        style={{
          background: 'var(--background)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.875rem 1.25rem',
          cursor: 'text',
          color: 'var(--foreground)'
        }}
        placeholder={selectedOption && selectedOption.value && !searchTerm ? '' : placeholder}
        value={searchTerm || (selectedOption && selectedOption.value && !searchTerm ? selectedOption.label : '')}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsOpen(true)}
      />

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1"
          style={{
            background: 'white',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)',
            maxHeight: '250px',
            overflowY: 'auto'
          }}
        >
          {/* Options List */}
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option)}
                className="w-full text-left hover:bg-blue-50 transition-colors duration-150"
                style={{
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid var(--border-light)',
                  fontSize: '0.9375rem',
                  color: 'var(--foreground)',
                  background: value === option.value ? 'var(--primary-light)' : 'transparent',
                  lineHeight: '1.4'
                }}
              >
                {option.label}
              </button>
            ))
          ) : (
            <div style={{ 
              padding: '1rem', 
              textAlign: 'center', 
              color: 'var(--foreground-tertiary)',
              fontSize: '0.875rem'
            }}>
              No options found
            </div>
          )}
        </div>
      )}

      {/* Hidden input for form validation */}
      {required && (
        <input
          type="hidden"
          value={value}
          required={required}
        />
      )}
    </div>
  )
}