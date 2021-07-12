from g2p_en import G2p
import sys

if __name__ == "__main__":
	args = sys.argv[1:]
	if len(args) != 1:
		print('Missing text to split into phonemes')
		sys.exit(1)

	text = args[0]
	g2p = G2p()
	print(g2p(text))
	sys.exit(0)
