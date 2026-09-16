#include<iostream>
using namespace std;

class Car {
    private:
        string make;
        string model;
        string alias;
        int year;
        int km;
    
    public:
        Car(string ma, string mod, string al, int yr, int milage): make(ma), model(mod), alias(al), year(yr), km(milage) {}

        string getMake() const {
            return make;
        }
        
        string getModel() const {
            return model;
        }
        
        string getAlias() const {
            return alias;
        }

        int getYear() const {
            return year;
        }
        
        int getKm() const {
            return km;
        }

        int setKm(int milage) {
            if (milage >= 0) {
                km = milage;
                return 0;
            }
            else {
                return 1;
            }
        }

        int addKm(int add) {
            if (add >= 0) {
                km += add;
                return 0;
            }
            else {
                return 1;
            }
        }
};