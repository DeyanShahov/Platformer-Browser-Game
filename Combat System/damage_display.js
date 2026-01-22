// Damage Number Manager - moved from combat_system.js
class DamageNumberManager {
    constructor() {
        this.activeNumbers = [];
        this.canvas = null;
    }

    init(canvas) {
        this.canvas = canvas;
    }

    // Add a damage number to display
    addDamageNumber(x, y, damage, isCritical = false) {
        if (!this.canvas) return;

        const number = {
            x: x,
            y: y,
            damage: damage,
            isCritical: isCritical,
            lifetime: 0,
            maxLifetime: 2.0, // seconds
            velocityY: -50, // pixels per second upward
            velocityX: (Math.random() - 0.5) * 20, // slight horizontal drift
            scale: isCritical ? 1.5 : 1.0
        };

        this.activeNumbers.push(number);
    }

    // Update all damage numbers
    update(dt) {
        this.activeNumbers = this.activeNumbers.filter(number => {
            number.lifetime += dt;
            number.y += number.velocityY * dt;
            number.x += number.velocityX * dt;

            // Fade out over time
            const fadeProgress = number.lifetime / number.maxLifetime;
            number.alpha = Math.max(0, 1 - fadeProgress);

            return number.lifetime < number.maxLifetime;
        });
    }

    // Render damage numbers
    render(ctx) {
        if (!ctx) return;

        this.activeNumbers.forEach(number => {
            ctx.save();

            // Set color based on damage type
            if (number.isCritical) {
                ctx.fillStyle = `rgba(255, 255, 0, ${number.alpha})`; // Yellow for crits
                ctx.strokeStyle = `rgba(255, 165, 0, ${number.alpha})`; // Orange outline
                ctx.lineWidth = 2;
            } else {
                ctx.fillStyle = `rgba(255, 0, 0, ${number.alpha})`; // Red for normal
                ctx.strokeStyle = `rgba(139, 0, 0, ${number.alpha})`; // Dark red outline
                ctx.lineWidth = 1;
            }

            ctx.font = `${32 * number.scale}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Draw text with outline for better visibility
            if (number.isCritical) {
                ctx.strokeText(number.damage.toString(), number.x, number.y);
            }
            ctx.fillText(number.damage.toString(), number.x, number.y);

            ctx.restore();
        });
    }
}

// Export globally for traditional JavaScript approach
window.DamageNumberManager = DamageNumberManager;
