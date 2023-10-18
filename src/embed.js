import { EmbedBuilder } from "discord.js";

const embed = (title, color, desc) => {
    return new EmbedBuilder()
    .setTitle(title)
	.setColor(color)
	.setDescription(desc)
	.setTimestamp()
}

export default embed