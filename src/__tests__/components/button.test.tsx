import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  describe('Renderizado basico', () => {
    it('debe renderizar el texto del boton', () => {
      render(<Button>Click me</Button>)

      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
    })

    it('debe renderizar como boton por defecto', () => {
      render(<Button>Test</Button>)

      const button = screen.getByRole('button')
      expect(button.tagName).toBe('BUTTON')
    })

    it('debe aplicar el data-slot correctamente', () => {
      render(<Button>Test</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('data-slot', 'button')
    })
  })

  describe('Variantes', () => {
    it('debe aplicar la variante default correctamente', () => {
      render(<Button variant="default">Default</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-primary')
    })

    it('debe aplicar la variante destructive correctamente', () => {
      render(<Button variant="destructive">Eliminar</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-destructive')
    })

    it('debe aplicar la variante outline correctamente', () => {
      render(<Button variant="outline">Outline</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('border')
    })

    it('debe aplicar la variante secondary correctamente', () => {
      render(<Button variant="secondary">Secondary</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-secondary')
    })

    it('debe aplicar la variante ghost correctamente', () => {
      render(<Button variant="ghost">Ghost</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('hover:bg-accent')
    })

    it('debe aplicar la variante link correctamente', () => {
      render(<Button variant="link">Link</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('text-primary')
    })
  })

  describe('Tamanos', () => {
    it('debe aplicar el tamano default correctamente', () => {
      render(<Button size="default">Default Size</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-9')
    })

    it('debe aplicar el tamano sm correctamente', () => {
      render(<Button size="sm">Small</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-8')
    })

    it('debe aplicar el tamano lg correctamente', () => {
      render(<Button size="lg">Large</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-10')
    })

    it('debe aplicar el tamano icon correctamente', () => {
      render(<Button size="icon">Icon</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('size-9')
    })
  })

  describe('Estados', () => {
    it('debe estar deshabilitado cuando disabled es true', () => {
      render(<Button disabled>Disabled</Button>)

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('debe tener la clase disabled cuando esta deshabilitado', () => {
      render(<Button disabled>Disabled</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('disabled:opacity-50')
    })
  })

  describe('Interacciones', () => {
    it('debe llamar onClick cuando se hace click', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()

      render(<Button onClick={handleClick}>Clickable</Button>)

      await user.click(screen.getByRole('button'))

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('no debe llamar onClick cuando esta deshabilitado', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()

      render(
        <Button onClick={handleClick} disabled>
          Disabled
        </Button>
      )

      await user.click(screen.getByRole('button'))

      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Props adicionales', () => {
    it('debe pasar props adicionales al elemento button', () => {
      render(<Button data-testid="custom-button">Test</Button>)

      expect(screen.getByTestId('custom-button')).toBeInTheDocument()
    })

    it('debe combinar className personalizado', () => {
      render(<Button className="custom-class">Test</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
    })

    it('debe aceptar el atributo type', () => {
      render(<Button type="submit">Submit</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'submit')
    })
  })
})
