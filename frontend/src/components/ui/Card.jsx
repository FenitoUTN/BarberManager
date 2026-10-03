/*
 * Superficie base de contenido.
 *
 * `.surface-card` ya trae fondo, borde, radio y sombra, así que acá no se repite ninguna de
 * esas cuatro propiedades: sólo el padding, que es lo único que cambia de bloque a bloque.
 *
 * `interactive` es la diferencia entre un cartão de lectura y uno que es un control. Sube el
 * borde y la sombra en hover, y sólo cuando además es un enlace agrega el anillo de foco:
 * un div con `cursor-pointer` no recibe foco por teclado, así que un anillo ahí sería
 * mentira visual.
 */

const PADDINGS = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

function Card({
  as: Component = 'div',
  padding = 'md',
  interactive = false,
  className = '',
  href,
  ...rest
}) {
  // `as={Link}` de react-router no es el string 'a', pero se detecta por `to`.
  const isLink = Component === 'a' || Boolean(href || rest.to);

  const interactiveClasses = interactive
    ? 'cursor-pointer transition-[border-color,box-shadow] duration-(--duration-base) ease-out ' +
      'hover:border-brand-line hover:shadow-raised' +
      (isLink ? ' focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand' : '')
    : '';

  const paddingClasses = PADDINGS[padding] ?? PADDINGS.md;

  return (
    <Component
      href={isLink ? href : undefined}
      className={`surface-card${paddingClasses ? ` ${paddingClasses}` : ''}${
        interactiveClasses ? ` ${interactiveClasses}` : ''
      }${className ? ` ${className}` : ''}`}
      {...rest}
    />
  );
}

export default Card;
