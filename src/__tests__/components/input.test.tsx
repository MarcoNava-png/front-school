import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Input } from '@/components/ui/input'

describe('Input Component', () => {
  describe('Renderizado basico', () => {
    it('debe renderizar un input', () => {
      render(<Input />)

      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('debe aplicar el data-slot correctamente', () => {
      render(<Input />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('data-slot', 'input')
    })

    it('debe renderizar con placeholder', () => {
      render(<Input placeholder="Enter your name" />)

      expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument()
    })
  })

  describe('Tipos de input', () => {
    it('debe renderizar como textbox por defecto', () => {
      render(<Input />)

      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()
    })

    it('debe renderizar tipo email', () => {
      render(<Input type="email" />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'email')
    })

    it('debe renderizar tipo password', () => {
      render(<Input type="password" data-testid="password-input" />)

      const input = screen.getByTestId('password-input')
      expect(input).toHaveAttribute('type', 'password')
    })

    it('debe renderizar tipo number', () => {
      render(<Input type="number" />)

      const input = screen.getByRole('spinbutton')
      expect(input).toHaveAttribute('type', 'number')
    })
  })

  describe('Estados', () => {
    it('debe estar deshabilitado cuando disabled es true', () => {
      render(<Input disabled />)

      const input = screen.getByRole('textbox')
      expect(input).toBeDisabled()
    })

    it('debe ser requerido cuando required es true', () => {
      render(<Input required />)

      const input = screen.getByRole('textbox')
      expect(input).toBeRequired()
    })

    it('debe ser readonly cuando readOnly es true', () => {
      render(<Input readOnly />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('readonly')
    })
  })

  describe('Interacciones', () => {
    it('debe permitir escribir texto', async () => {
      const user = userEvent.setup()
      render(<Input />)

      const input = screen.getByRole('textbox')
      await user.type(input, 'Hello World')

      expect(input).toHaveValue('Hello World')
    })

    it('debe llamar onChange cuando se escribe', async () => {
      const handleChange = jest.fn()
      const user = userEvent.setup()
      render(<Input onChange={handleChange} />)

      const input = screen.getByRole('textbox')
      await user.type(input, 'Test')

      expect(handleChange).toHaveBeenCalled()
    })

    it('debe llamar onFocus cuando recibe foco', async () => {
      const handleFocus = jest.fn()
      const user = userEvent.setup()
      render(<Input onFocus={handleFocus} />)

      const input = screen.getByRole('textbox')
      await user.click(input)

      expect(handleFocus).toHaveBeenCalledTimes(1)
    })

    it('debe llamar onBlur cuando pierde foco', async () => {
      const handleBlur = jest.fn()
      const user = userEvent.setup()
      render(
        <>
          <Input onBlur={handleBlur} />
          <button>Other element</button>
        </>
      )

      const input = screen.getByRole('textbox')
      await user.click(input)
      await user.tab()

      expect(handleBlur).toHaveBeenCalledTimes(1)
    })

    it('no debe permitir escribir cuando esta deshabilitado', async () => {
      const user = userEvent.setup()
      render(<Input disabled value="" onChange={() => {}} />)

      const input = screen.getByRole('textbox')
      await user.type(input, 'Hello')

      expect(input).toHaveValue('')
    })
  })

  describe('Props adicionales', () => {
    it('debe aceptar valor inicial', () => {
      render(<Input defaultValue="Initial value" />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveValue('Initial value')
    })

    it('debe aceptar valor controlado', () => {
      render(<Input value="Controlled value" onChange={() => {}} />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveValue('Controlled value')
    })

    it('debe aceptar className personalizado', () => {
      render(<Input className="custom-class" />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('custom-class')
    })

    it('debe aceptar maxLength', () => {
      render(<Input maxLength={10} />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('maxLength', '10')
    })

    it('debe aceptar minLength', () => {
      render(<Input minLength={5} />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('minLength', '5')
    })

    it('debe aceptar name', () => {
      render(<Input name="email" />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('name', 'email')
    })

    it('debe aceptar id', () => {
      render(<Input id="input-id" />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('id', 'input-id')
    })
  })

  describe('Accesibilidad', () => {
    it('debe tener aria-invalid cuando hay error', () => {
      render(<Input aria-invalid={true} />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    it('debe tener aria-describedby para mensajes de error', () => {
      render(<Input aria-describedby="error-message" />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-describedby', 'error-message')
    })
  })
})
