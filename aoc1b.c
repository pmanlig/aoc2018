#include <stdio.h>
#define MAX_STEG 200000

int seen(long *freqs, long max, long freq) {
    for (long i=0; i < max; i++) {
        if (freqs[i] == freq) return 1;
    }
    return 0;
}

void main() {
    long input[1024], num=0, freq=0, index=0, used[MAX_STEG];
    while (!feof(stdin)) {
        if (scanf("%ld", &index) > 0) input[num++] = index;
    }
    index=0;
    printf("Calculating:\n");
    used[0]=0;
    freq=0;
    for (long i=1;i<MAX_STEG;) {
        freq += input[index++];
        if (index >= num) index=0;
        if (seen(used, i, freq)) {
            printf("Frekvens %ld repeterar efter %ld steg.\n", freq, i);
            return;
        }
        used[i++] = freq;
    }
    printf("För många steg!\n");
}